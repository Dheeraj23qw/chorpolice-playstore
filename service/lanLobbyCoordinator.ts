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
import { getLocalIpAddress, getGatewayIpAddress } from "@/utils/NetworkUtils";
import {
  createInitialLobbyPlayers,
  replaceFirstBotWithPlayer,
  replacePlayerWithBot,
} from "@/utils/lobbyPlayers";
import { LanRoomCodeService } from "./network/LanRoomCodeService";
import { LanDiscoveryService } from "./network/LanDiscoveryService";
import { LanCandidateIpService } from "./network/LanCandidateIpService";
import { DiscoveryResult } from "./network/LanDiscoveryStrategy";

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
import NetInfo from "@react-native-community/netinfo";
import { logLanDebug, updateDebugMetric } from "./observability/DebugService";

let unsubscribeNetInfo: (() => void) | null = null;
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

const LAN_CANDIDATE_IPS = [
  "192.168.43.1",
  "192.168.49.1",
  "192.168.1.1",
  "172.20.10.1",
];

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
    roomCode: state.roomCode,
    player: {
      id: state.localPlayerId,
      name: state.localPlayerName.trim() || "User",
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

    // ✅ ROOM CODE VALIDATION: Host verifies the room code matches
    if (packet.roomCode && state.roomCode && packet.roomCode !== state.roomCode) {
      console.warn(`[Lobby] Rejecting join: room code mismatch (${packet.roomCode} vs ${state.roomCode})`);
      if (sourceIp) {
        sendPacketToPeer(sourceIp, {
          type: NETWORK.PLAYER_JOIN_REJECT,
          reason: "invalid_room_code",
        });
      }
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
        logLanDebug("client connected");
        updateDebugMetric("lanClientConnection", "connected");
        toast.success("All set! 🎉", "You've successfully joined the room.");
      }
    }
    return;
  }

  if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
    clearJoinAttempts();
    
    // 🚀 TERMINATE GAME IF IN PROGRESS (Chor Police or Quiz)
    // If any HUMAN player leaves while the game is NOT in the lobby (idle),
    // we end the session immediately to preserve integrity.
    if (state.gamePhase !== "idle") {
      const leaver = state.players.find(p => p.id === packet.playerId);
      const isBot = leaver?.isBot ?? false;

      // Only end if it's a human (bots leaving/being replaced is handled differently)
      if (!isBot) {
        console.log(`[LobbyCoordinator] 🛑 Game terminating: Human player ${packet.playerId} left.`);
        store.dispatch(setConnectionStatus("ERROR"));
        store.dispatch(setSessionError(
          state.isHost 
            ? `${leaver?.name || "A player"} left the game. Session terminated.`
            : "The host or a player disconnected. Game ended."
        ));
        void leaveLanLobby();
        return;
      }
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
    if (
      packet.playerId === state.localPlayerId &&
      packet.reason !== "player_quit" &&
      packet.reason !== "user_exit"
    ) {
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(setSessionError("Lost connection to the room."));
    }
    return;
  }

  if (packet.type === NETWORK.PLAYER_JOIN_REJECT) {
    clearJoinAttempts();
    store.dispatch(setConnectionStatus("ERROR"));
    const errorMsg = packet.reason === "room_full" 
      ? "This room already has 4 real players." 
      : packet.reason === "invalid_room_code"
      ? "Invalid Room Code. Make sure you entered it correctly."
      : "Could not join the room.";
    store.dispatch(setSessionError(errorMsg));
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
  if (unsubscribeNetInfo) {
    unsubscribeNetInfo();
    unsubscribeNetInfo = null;
  }
  HeartbeatService.stop();
  await GameSessionTransport.stop();
  await LanDiscoveryService.stopBroadcasting();
  LanDiscoveryService.stopListening();
};
/**
 * 🚀 Step 1: Initialize the local lobby state (Offline/Local mode).
 * This allows the user to see themselves and bots immediately.
 * Does NOT start the server or check network.
 */
export const initHostLobby = ({
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
  console.log(`[LobbyCoordinator] 🏠 Initializing local lobby for player=${localPlayerId}`);
  
  const players = createInitialLobbyPlayers({
    id: localPlayerId,
    name,
    avatarId,
    coins,
  });

  store.dispatch(configureSessionState({
    isHost: true,
    localPlayerId,
    gameType,
  }));
  store.dispatch(setLobbyPlayers(players));
  store.dispatch(setLobbyStage("room"));
  store.dispatch(setConnectionStatus("IDLE")); // Ready for local play
  store.dispatch(setSessionError(null));

  // 🤖 Realistic bot entry toasts
  const initialBots = players.filter((p) => p.isBot);
  initialBots.forEach((bot, index) => {
    const t = setTimeout(() => {
      toast.info(`${bot.name} joined.`);
    }, 900 * (index + 1));
    botAnnouncementTimers.push(t);
  });
};

/**
 * 🚀 Step 2: Activate LAN features (Online mode).
 * Starts the TCP server on 0.0.0.0 and begins IP detection.
 */
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
  
  // If already hosting on LAN, skip
  if (
    existingSession.isHost &&
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
    console.log(`[LobbyCoordinator] 📡 Activating LAN server for player=${localPlayerId}`);
    
    // 0️⃣ GENERATE STABLE ROOM CODE
    const stableRoomCode = LanRoomCodeService.generateRandom();

    // Ensure we have packet listeners
    ensurePacketSubscription();

    // 1️⃣ START SERVER (on 0.0.0.0)
    try {
      logLanDebug("Invite clicked, starting server on 0.0.0.0...");
      updateDebugMetric("lanStatus", "starting");
      await GameSessionTransport.start({
        isHost: true,
        localPlayerId,
        onPacket: (packet, sourceIp) => handleIncomingPacket(packet, sourceIp),
      });
      const port = GameSessionTransport.getListeningPort();
      logLanDebug(`TCP server listening on 0.0.0.0:${port}`);
      updateDebugMetric("lanStatus", "listening");
      updateDebugMetric("lanPort", port);
    } catch (error) {
      logLanDebug("TCP server failed", error);
      updateDebugMetric("lanStatus", "failed");
      updateDebugMetric("lanLastError", String(error));
      console.error("[LobbyCoordinator] ❌ Server bootstrap failed:", error);
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(setSessionError("Failed to start local server. Please retry."));
      throw error;
    }

    const actualPort = GameSessionTransport.getListeningPort();
    
    // 2️⃣ UPDATE STATUS
    store.dispatch(setConnectionStatus("HOSTING"));
    store.dispatch(setSessionError(null));

    // 3️⃣ ASYNC IP DETECTION LOOP
    void (async () => {
      let lastSyncedIp: string | null = "INITIAL_UNSET";
      let attempts = 0;
      const maxFastAttempts = 8; // First 4 seconds (500ms * 8)
      const startTime = Date.now();

      console.log("[LobbyCoordinator] 🔍 Starting automatic IP detection loop...");

      unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        console.log(`[LobbyCoordinator] 📡 NetInfo changed (type=${state.type}, connected=${state.isConnected}) → triggering IP re-check`);
      });

      while (attempts < 200) { 
        attempts++;
        const elapsed = Date.now() - startTime;
        
        // After 4 seconds of scanning with no luck, we allow auto-fallback IPs
        const allowAutoFallback = elapsed > 4000;
        
        const { ip: currentIp, isFallback: currentIsFallback } = await getLocalIpAddress({ 
          useFallback: allowAutoFallback 
        });
        
        const session = store.getState().session;
        const isHardwareFoundOverFallback = currentIp && !currentIsFallback && session.isFallback;
        const isIpChanged = currentIp !== lastSyncedIp;

        if (currentIp && (isIpChanged || isHardwareFoundOverFallback)) {
            lastSyncedIp = currentIp;
            const roomCode = stableRoomCode;
            
            // Build ENRICHED QR Payload
            const qrPayloadObj = {
              ip: currentIp,
              port: actualPort,
              roomCode: roomCode,
              candidateIps: LanCandidateIpService.getCandidateIps(
                parseInt(currentIp.split(".")[3], 10),
                { localIp: currentIp, gatewayIp: null }
              ),
            };
            const qrPayload = JSON.stringify(qrPayloadObj);
 
            logLanDebug(`selected IP: ${currentIp} (fallback=${currentIsFallback})`);
            updateDebugMetric("hostIp", currentIp);
            updateDebugMetric("lanIsFallback", currentIsFallback);
            updateDebugMetric("lanQrPayload", qrPayload);
 
            console.log(
              `[LobbyCoordinator] 🔄 IP Detected: ${currentIp} (after ${elapsed}ms). ` +
              `Fallback: ${currentIsFallback ? "YES" : "NO"}. Updating session.`
            );
            
            store.dispatch(setSessionNetworkInfo({ 
              hostIp: currentIp, 
              roomCode: roomCode,
              isFallback: currentIsFallback
            }));
            store.dispatch(setLocalSessionIdentity({ localIp: currentIp }));

            // 🚀 Start UDP Broadcasting
            if (roomCode) {
              LanDiscoveryService.startBroadcasting({
                roomCode,
                tcpPort: actualPort,
                hostName: name,
                lobbyId: localPlayerId,
                hostIp: currentIp,          // ← subnet broadcast now works
                version: "1.0.0"
              });
            }
         }

        const delay = attempts <= maxFastAttempts ? 500 : 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        if (store.getState().session.connectionStatus !== "HOSTING") break;
      }
    })();

    startHeartbeat(true);

    return {
      hostIp: null,
      roomCode: null,
      players: store.getState().session.players,
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
  candidateIps = [],
  roomCode,
  localPlayerId,
  name,
  avatarId,
  coins,
  gameType,
}: {
  hostIp: string;
  hostPort?: number;
  candidateIps?: string[];
  roomCode?: string | null;
  localPlayerId: string;
  name: string;
  avatarId: number;
  coins: number;
  gameType: string;
}) => {
  await stopCoordinator();
  ensurePacketSubscription();

  const actualPort = hostPort || NETWORK.TCP_SERVER_PORT;
  
  // For manual join via code, we don't have a reliable last octet anymore (stable code).
  // So we try common gateways + provided hostIp + any specific candidates.
  const allCandidates = Array.from(new Set([
    ...(hostIp ? [hostIp] : []),
    ...candidateIps,
    ...LanCandidateIpService.getCommonGateways()
  ]));

  console.log(`[LobbyCoordinator] 🔗 Starting Smart Join. Candidates: ${allCandidates.join(", ")}`);
  logLanDebug(`Starting Smart Join with ${allCandidates.length} candidates`);
  updateDebugMetric("lanClientConnection", "searching");

  let connectedIp: string | null = null;

  // 1️⃣ TRY ALL CANDIDATES SEQUENTIALLY
  for (const ip of allCandidates) {
    try {
      console.log(`[LobbyCoordinator] 📡 Trying candidate: ${ip}...`);
      await GameSessionTransport.connectAsync(ip, actualPort);
      connectedIp = ip;
      console.log(`[LobbyCoordinator] ✅ Connected successfully to: ${ip}`);
      break;
    } catch (e) {
      console.log(`[LobbyCoordinator] ❌ Failed ${ip}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (!connectedIp) {
    console.log(`[LobbyCoordinator] 🛑 All candidates failed.`);
    store.dispatch(setConnectionStatus("ERROR"));
    store.dispatch(
      setSessionError(
        "Make sure all players are connected to the same hotspot or same WiFi router."
      ),
    );
    updateDebugMetric("lanClientConnection", "failed");
    return;
  }

  // 2️⃣ SUCCESS: Configure State
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
      hostIp: connectedIp,
      roomCode: roomCode || encodeRoomCode(connectedIp, actualPort),
    }),
  );
  store.dispatch(setLobbyPlayers([]));
  store.dispatch(setConnectionStatus("CONNECTING"));
  store.dispatch(setSessionError(null));
  store.dispatch(setLobbyStage("room"));

  setSessionHostIp(connectedIp, actualPort);
  logLanDebug(`client connected to ${connectedIp}`);
  updateDebugMetric("lanClientConnection", "connected");

  clearJoinAttempts();

  const sendJoinPacket = () => {
    const latestState = store.getState().session;
    if (latestState.connectionStatus !== "CONNECTING" && latestState.connectionStatus !== "CONNECTED") {
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
  }, 100);

  // 🚀 Start heartbeat on client side to monitor host
  startHeartbeat(false);

  joinRetryInterval = setInterval(() => {
    sendJoinPacket();
  }, 1500);

  joinTimeout = setTimeout(() => {
    const latestState = store.getState().session;
    if (latestState.connectionStatus === "CONNECTING") {
      clearJoinAttempts();
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(
        setSessionError(
          "Make sure all players are connected to the same hotspot or same WiFi router."
        ),
      );
    }
  }, 10000);
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

export const getCandidateIpsForRoomCode = (
  roomCode: string, 
  localIp: string | null, 
  gatewayIp: string | null
): string[] => {
  const parsed = LanRoomCodeService.parse(roomCode);
  if (!parsed) return [];
  
  // Note: with stable room codes, we can't reliably guess the octet from the code anymore.
  // So we return the common gateways.
  return LanCandidateIpService.getCommonGateways();
};

export const startLanDiscovery = (onDiscovery: (result: DiscoveryResult) => void) => {
  LanDiscoveryService.startListening(onDiscovery);
};

export const stopLanDiscovery = () => {
  LanDiscoveryService.stopListening();
};
