import { NETWORK } from "@/constants/Networking";
import { toast } from "@/components/feedback/toast";
import {
  clearSession,
  configureSessionState,
  SessionPlayer,
  setConnectionStatus,
  setLobbyStage,
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
import { decodeRoomCodeWithLocalContext, encodeRoomCode } from "@/utils/roomCode";

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
let pendingHostLobbyPromise: Promise<{
  hostIp: string | null;
  roomCode: string | null;
  players: SessionPlayer[];
}> | null = null;

// 🚀 Deduplication: tracks player IDs that have already received a join toast
// in this lobby session. Cleared when the lobby stops.
const announcedPlayerIds = new Set<string>();

// Tracks staggered bot announcement timers so they can be cancelled on stop
const botAnnouncementTimers: ReturnType<typeof setTimeout>[] = [];

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
  const { lobbyStage } = store.getState().session;
  broadcastPacket(
    {
      type: NETWORK.PLAYER_LIST_UPDATE,
      players,
      lobbyStage,
    },
    { processLocally: false },
  );
};

const sanitizePlayer = (
  player: Partial<SessionPlayer> | undefined,
  fallbackId: string,
  humanIndex: number = 1,
) => ({
  id: player?.id || fallbackId,
  name: player?.name?.trim() || `PLAYER_${humanIndex}`,
  avatarId:
    typeof player?.avatarId === "number" && player.avatarId > 0
      ? player.avatarId
      : 1,
  isBot: Boolean(player?.isBot),
  coins: typeof player?.coins === "number" ? player.coins : 0,
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
      name: state.localPlayerName.trim() || loadUsername(),
      avatarId: state.localAvatarId || 1,
      isBot: false,
      coins: store.getState().wallet.coins,
    },
  };
};

const updateHostLocalPlayer = ({
  name,
  avatarId,
  coins,
}: {
  name?: string;
  avatarId?: number;
  coins?: number;
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
    ...(name !== undefined ? { name: name.trim() || `User_${Math.floor(100 + Math.random() * 900)}` } : {}),
    ...(avatarId !== undefined ? { avatarId } : {}),
    ...(coins !== undefined ? { coins } : {}),
  };

  if (
    nextPlayer.name === currentPlayer.name &&
    nextPlayer.avatarId === currentPlayer.avatarId &&
    nextPlayer.coins === currentPlayer.coins
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
    console.log(`[Lobby] Player joining from ${sourceIp}:`, packet.player);
    if (!state.isHost) {
      return;
    }

    const humansCount = state.players.filter((p) => !p.isBot).length;
    const joiningPlayer = sanitizePlayer(
      packet.player,
      `guest_${Date.now()}`,
      humansCount + 1,
    );
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

    const isNewJoin = !announcedPlayerIds.has(joiningPlayer.id);

    syncPlayerListLocally(nextPlayers);
    broadcastPlayerList(nextPlayers);

    if (isNewJoin) {
      announcedPlayerIds.add(joiningPlayer.id);
      toast.success(`${joiningPlayer.name} joined!`);
    }
    return;
  }

  if (packet.type === NETWORK.PLAYER_LIST_UPDATE && Array.isArray(packet.players)) {
    console.log("[Lobby] Received player list update:", packet.players.length, "players");
    clearJoinAttempts();
    syncPlayerListLocally(packet.players);
    store.dispatch(setLobbyStage(packet.lobbyStage === "setup" ? "setup" : "room"));
    if (!state.isHost) {
      const wasConnecting = state.connectionStatus === "CONNECTING";
      store.dispatch(setConnectionStatus("CONNECTED"));
      store.dispatch(setSessionError(null));

      if (wasConnecting) {
        toast.success("Congrats! You connected with the host.");
      }
    }
    return;
  }

  if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
    clearJoinAttempts();
    
    // 🚀 TERMINATE GAME IF IN PROGRESS
    if (state.gamePhase !== "idle") {
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(setSessionError("Someone left the game. Session terminated."));
      void leaveLanLobby();
      return;
    }

    if (state.isHost) {
      unregisterRemotePeer(packet.playerId);
      const departingPlayer = state.players.find(p => p.id === packet.playerId);
      const nextPlayers = replacePlayerWithBot(state.players, packet.playerId);

      if (nextPlayers !== state.players) {
        syncPlayerListLocally(nextPlayers);
        broadcastPlayerList(nextPlayers);
        
        // 🤖 Realistic notification for bot substitution
        const botIndex = state.players.findIndex(p => p.id === packet.playerId);
        const bot = nextPlayers[botIndex];
        if (bot && bot.isBot) {
          toast.info(`${departingPlayer?.name || "Player"} left. ${bot.name} joined.`);
        }
      }
      return;
    }

    // PROD-2 FIX: Only show ERROR if this was NOT a self-initiated leave.
    // A self-leave has reason "player_quit" or comes from our own leaveLanLobby().
    // Avoid showing "You were disconnected" when the player tapped Back.
    if (
      packet.playerId === state.localPlayerId &&
      packet.reason !== "player_quit" &&
      packet.reason !== "user_exit"
    ) {
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

  // Cancel any pending bot announcement timers
  botAnnouncementTimers.forEach((t) => clearTimeout(t));
  botAnnouncementTimers.length = 0;

  // Reset deduplication set for the next session
  announcedPlayerIds.clear();

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
  coins,
  gameType,
}: {
  localPlayerId: string;
  name: string;
  avatarId: number;
  coins: number;
  gameType: string;
}) => {
  if (pendingHostLobbyPromise) {
    return pendingHostLobbyPromise;
  }

  const existingSession = store.getState().session;
  const existingTransport = GameSessionTransport.getSnapshot();
  if (
    existingSession.isHost &&
    existingSession.localPlayerId === localPlayerId &&
    existingSession.gameType === gameType &&
    existingSession.connectionStatus === "HOSTING" &&
    existingTransport.isHost
  ) {
    return {
      hostIp: existingSession.hostIp,
      roomCode: existingSession.roomCode,
      players: existingSession.players,
    };
  }

  pendingHostLobbyPromise = (async () => {
    await stopCoordinator();
    ensurePacketSubscription();

    try {
      await GameSessionTransport.start({
        isHost: true,
        localPlayerId,
        onPacket: (packet, sourceIp) => handleIncomingPacket(packet, sourceIp),
      });
    } catch (error) {
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(
        setSessionError(
          "Could not start the local lobby server. Please reopen the lobby.",
        ),
      );
      throw error;
    }

    // The transport may have bound on a fallback port if the primary was busy.
    const actualPort = GameSessionTransport.getListeningPort();
    if (__DEV__) {
      console.log(`[LobbyCoordinator] Server listening on port ${actualPort}`);
    }

    const hostIp = await getLocalIpAddress();
    // 🚀 Include actual port so room code works even on fallback ports
    const roomCode = hostIp ? encodeRoomCode(hostIp, actualPort) : null;
    const players = createInitialLobbyPlayers({
      id: localPlayerId,
      name,
      avatarId,
      coins,
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
    store.dispatch(setLobbyStage("room"));
    
    // 🚀 Realistic bot entry: announce one-by-one with staggered delay
    const initialBots = players.filter((p) => p.isBot);
    initialBots.forEach((bot, index) => {
      const t = setTimeout(() => {
        toast.info(`${bot.name} joined.`);
      }, 900 * (index + 1));
      botAnnouncementTimers.push(t);
    });

    startHeartbeat(true);

    return {
      hostIp,
      roomCode,
      players,
      port: actualPort,
    };
  })();

  try {
    return await pendingHostLobbyPromise;
  } finally {
    pendingHostLobbyPromise = null;
  }
};
export const joinLanLobby = async ({
  hostIp,
  hostPort,
  localPlayerId,
  name,
  avatarId,
  coins,
  gameType,
}: {
  hostIp: string;
  hostPort?: number;
  localPlayerId: string;
  name: string;
  avatarId: number;
  coins: number;
  gameType: string;
}) => {
  await stopCoordinator();
  ensurePacketSubscription();

  if (__DEV__) {
    console.log(`[LobbyCoordinator] Joining host at ${hostIp}:${hostPort ?? "default"}`);
  }

  await GameSessionTransport.start({
    isHost: false,
    localPlayerId,
    hostPort,
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
      roomCode: encodeRoomCode(hostIp, hostPort),
    }),
  );
  store.dispatch(setLobbyPlayers([]));
  store.dispatch(setConnectionStatus("CONNECTING"));
  store.dispatch(setSessionError(null));
  store.dispatch(setLobbyStage("room"));

  setSessionHostIp(hostIp, hostPort);

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
  coins,
}: {
  name?: string;
  avatarId?: number;
  coins?: number;
}) => {
  console.log("[Lobby] Syncing profile:", { name, avatarId, coins });
  store.dispatch(setLocalSessionIdentity({ name, avatarId }));
  const latestState = store.getState().session;

  if (latestState.isHost) {
    const nextPlayers = updateHostLocalPlayer({ name, avatarId, coins });
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
      reason: "player_quit", // SWEEP-3 FIX: needed so PROD-2 guard skips the error toast
    });
  }

  await stopCoordinator();
  store.dispatch(clearSession());
};

export const decodeLanRoomCode = async (roomCode: string) => {
  const localIp = await getLocalIpAddress();
  // Returns { ip, port } or null
  return decodeRoomCodeWithLocalContext(roomCode, localIp);
};
