import { NETWORK } from "@/constants/Networking";
import {
  clearSession,
  configureSessionState,
  SessionPlayer,
  setConnectionStatus,
  setLobbyPlayers,
  setLocalSessionIdentity,
  setSessionError,
  setSessionNetworkInfo,
} from "@/redux/reducers/sessionSlice";
import store from "@/redux/store";
import { getLocalIpAddress } from "@/utils/NetworkUtils";
import {
  createInitialLobbyPlayers,
  replaceFirstBotWithPlayer,
  replacePlayerWithBot,
} from "@/utils/lobbyPlayers";
import { decodeRoomCode, encodeRoomCode } from "@/utils/roomCode";

import {
  broadcastPacket,
  clearAllListeners,
  handleIncomingPacket,
  registerRemotePeer,
  sendPacketToHost,
  sendPacketToPeer,
  setSessionHostIp,
  startHeartbeat,
  subscribeToPackets,
  unregisterRemotePeer,
} from "./lanGameService";
import { HeartbeatService } from "./network/HeartbeatService";
import { GameSessionTransport } from "./network/GameSessionTransport";

let unsubscribePackets: (() => void) | null = null;
let joinRetryInterval: ReturnType<typeof setInterval> | null = null;
let joinTimeout: ReturnType<typeof setTimeout> | null = null;

const clearJoinAttempts = () => {
  if (joinRetryInterval) {
    clearInterval(joinRetryInterval);
    joinRetryInterval = null;
  }

  if (joinTimeout) {
    clearTimeout(joinTimeout);
    joinTimeout = null;
  }
};

const broadcastPlayerList = (players: SessionPlayer[]) => {
  broadcastPacket(
    {
      type: NETWORK.PLAYER_LIST_UPDATE,
      players,
    },
    { processLocally: false },
  );
};

const sanitizePlayer = (player: Partial<SessionPlayer> | undefined, fallbackId: string) => ({
  id: player?.id || fallbackId,
  name: player?.name?.trim() || "PLAYER",
  avatarId:
    typeof player?.avatarId === "number" && player.avatarId > 0
      ? player.avatarId
      : 1,
  isBot: Boolean(player?.isBot),
});

const syncPlayerListLocally = (players: SessionPlayer[]) => {
  store.dispatch(setLobbyPlayers(players.slice(0, 4)));
};

const buildJoinPacketFromState = () => {
  const state = store.getState().session;

  if (!state.localPlayerId) {
    return null;
  }

  return {
    type: NETWORK.PLAYER_JOIN,
    player: {
      id: state.localPlayerId,
      name: state.localPlayerName.trim() || "PLAYER",
      avatarId: state.localAvatarId || 1,
      isBot: false,
    },
  };
};

const updateHostLocalPlayer = ({
  name,
  avatarId,
}: {
  name?: string;
  avatarId?: number;
}) => {
  const state = store.getState().session;

  if (!state.localPlayerId) {
    return null;
  }

  const localPlayerIndex = state.players.findIndex(
    (player) => player.id === state.localPlayerId,
  );

  if (localPlayerIndex < 0) {
    return null;
  }

  const currentPlayer = state.players[localPlayerIndex];
  const nextPlayer = {
    ...currentPlayer,
    ...(name !== undefined ? { name: name.trim() || "PLAYER" } : {}),
    ...(avatarId !== undefined ? { avatarId } : {}),
  };

  if (
    nextPlayer.name === currentPlayer.name &&
    nextPlayer.avatarId === currentPlayer.avatarId
  ) {
    return state.players;
  }

  const nextPlayers = [...state.players];
  nextPlayers[localPlayerIndex] = nextPlayer;
  return nextPlayers;
};

const handleLobbyPacket = (packet: any, sourceIp?: string) => {
  const state = store.getState().session;

  if (!packet?.type) {
    return;
  }

  if (packet.type === NETWORK.PLAYER_JOIN) {
    if (!state.isHost) {
      return;
    }

    const joiningPlayer = sanitizePlayer(packet.player, `guest_${Date.now()}`);
    const nextPlayers = replaceFirstBotWithPlayer(state.players, {
      ...joiningPlayer,
      isBot: false,
    });

    if (!nextPlayers) {
      if (sourceIp) {
        sendPacketToPeer(sourceIp, {
          type: NETWORK.PLAYER_JOIN_REJECT,
          reason: "room_full",
        });
      }
      return;
    }

    if (sourceIp) {
      registerRemotePeer(joiningPlayer.id, sourceIp);
    }

    syncPlayerListLocally(nextPlayers);
    broadcastPlayerList(nextPlayers);
    return;
  }

  if (packet.type === NETWORK.PLAYER_LIST_UPDATE && Array.isArray(packet.players)) {
    clearJoinAttempts();
    syncPlayerListLocally(packet.players);
    if (!state.isHost) {
      store.dispatch(setConnectionStatus("CONNECTED"));
      store.dispatch(setSessionError(null));
    }
    return;
  }

  if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
    clearJoinAttempts();
    if (state.isHost) {
      unregisterRemotePeer(packet.playerId);
      const nextPlayers = replacePlayerWithBot(state.players, packet.playerId);

      if (nextPlayers !== state.players) {
        syncPlayerListLocally(nextPlayers);
        broadcastPlayerList(nextPlayers);
      }
      return;
    }

    if (packet.playerId === state.localPlayerId) {
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(setSessionError("You were disconnected from the host."));
    }
    return;
  }

  if (packet.type === NETWORK.PLAYER_JOIN_REJECT) {
    clearJoinAttempts();
    store.dispatch(setConnectionStatus("ERROR"));
    store.dispatch(setSessionError("This room already has 4 real players."));
  }
};

const ensurePacketSubscription = () => {
  if (unsubscribePackets) {
    unsubscribePackets();
    unsubscribePackets = null;
  }

  clearAllListeners();
  unsubscribePackets = subscribeToPackets((packet, sourceIp) => {
    handleLobbyPacket(packet, sourceIp);
  });
};

const stopCoordinator = async () => {
  clearJoinAttempts();
  if (unsubscribePackets) {
    unsubscribePackets();
    unsubscribePackets = null;
  }
  HeartbeatService.stop();
  await GameSessionTransport.stop();
};

export const hostLanLobby = async ({
  localPlayerId,
  name,
  avatarId,
  gameType,
}: {
  localPlayerId: string;
  name: string;
  avatarId: number;
  gameType: string;
}) => {
  await stopCoordinator();
  ensurePacketSubscription();

  await GameSessionTransport.start({
    isHost: true,
    localPlayerId,
    onPacket: (packet, sourceIp) => handleIncomingPacket(packet, sourceIp),
  });

  const hostIp = await getLocalIpAddress();
  const roomCode = hostIp ? encodeRoomCode(hostIp) : null;
  const players = createInitialLobbyPlayers({
    id: localPlayerId,
    name,
    avatarId,
  });

  store.dispatch(
    configureSessionState({
      isHost: true,
      localPlayerId,
      gameType,
    }),
  );
  store.dispatch(
    setLocalSessionIdentity({
      localPlayerId,
      name,
      avatarId,
      localIp: hostIp,
    }),
  );
  store.dispatch(
    setSessionNetworkInfo({
      hostIp,
      roomCode,
    }),
  );
  store.dispatch(setConnectionStatus("HOSTING"));
  store.dispatch(setLobbyPlayers(players));
  store.dispatch(setSessionError(null));

  startHeartbeat(true);

  return {
    hostIp,
    roomCode,
    players,
  };
};

export const joinLanLobby = async ({
  hostIp,
  localPlayerId,
  name,
  avatarId,
  gameType,
}: {
  hostIp: string;
  localPlayerId: string;
  name: string;
  avatarId: number;
  gameType: string;
}) => {
  await stopCoordinator();
  ensurePacketSubscription();

  await GameSessionTransport.start({
    isHost: false,
    localPlayerId,
    onPacket: (packet, sourceIp) => handleIncomingPacket(packet, sourceIp),
  });

  store.dispatch(
    configureSessionState({
      isHost: false,
      localPlayerId,
      gameType,
    }),
  );
  store.dispatch(
    setLocalSessionIdentity({
      localPlayerId,
      name,
      avatarId,
    }),
  );
  store.dispatch(
    setSessionNetworkInfo({
      hostIp,
      roomCode: encodeRoomCode(hostIp),
    }),
  );
  store.dispatch(setLobbyPlayers([]));
  store.dispatch(setConnectionStatus("CONNECTING"));
  store.dispatch(setSessionError(null));

  setSessionHostIp(hostIp);

  clearJoinAttempts();

  const sendJoinPacket = () => {
    const latestState = store.getState().session;
    if (latestState.connectionStatus !== "CONNECTING") {
      clearJoinAttempts();
      return;
    }

    const joinPacket = buildJoinPacketFromState();
    if (joinPacket) {
      sendPacketToHost(joinPacket);
    }
  };

  setTimeout(() => {
    sendJoinPacket();
  }, 350);

  joinRetryInterval = setInterval(() => {
    sendJoinPacket();
  }, 1200);

  joinTimeout = setTimeout(() => {
    const latestState = store.getState().session;
    if (latestState.connectionStatus === "CONNECTING") {
      clearJoinAttempts();
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(
        setSessionError(
          "Could not reach the host. Check same Wi-Fi or try mobile hotspot.",
        ),
      );
    }
  }, 8000);
};

export const syncLocalLobbyProfile = ({
  name,
  avatarId,
}: {
  name?: string;
  avatarId?: number;
}) => {
  store.dispatch(setLocalSessionIdentity({ name, avatarId }));
  const latestState = store.getState().session;

  if (latestState.isHost) {
    const nextPlayers = updateHostLocalPlayer({ name, avatarId });
    if (nextPlayers && nextPlayers !== latestState.players) {
      syncPlayerListLocally(nextPlayers);
      broadcastPlayerList(nextPlayers);
    }
    return;
  }

  if (
    latestState.connectionStatus === "CONNECTED" ||
    latestState.connectionStatus === "CONNECTING"
  ) {
    const joinPacket = buildJoinPacketFromState();
    if (joinPacket) {
      sendPacketToHost(joinPacket);
    }
  }
};

export const leaveLanLobby = async () => {
  clearJoinAttempts();
  const state = store.getState().session;

  if (!state.isHost && state.localPlayerId) {
    sendPacketToHost({
      type: NETWORK.PLAYER_LEAVE,
      playerId: state.localPlayerId,
    });
  }

  await stopCoordinator();
  store.dispatch(clearSession());
};

export const decodeLanRoomCode = (roomCode: string) => decodeRoomCode(roomCode);
