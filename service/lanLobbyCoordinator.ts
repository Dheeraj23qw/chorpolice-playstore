/**
 * lanLobbyCoordinator — High-level lobby orchestrator.
 *
 * Delegates to:
 *  - LobbyPacketHandler: all packet handling logic
 *  - HostIpDetector: async IP detection loop
 *  - LobbyDataHelpers: sanitization & join packet building
 */
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
import { createInitialLobbyPlayers } from "@/utils/lobbyPlayers";
import { encodeRoomCode } from "@/utils/roomCode";
import { LanRoomCodeService } from "./network/LanRoomCodeService";
import { LanDiscoveryService } from "./network/LanDiscoveryService";
import { LanCandidateIpService } from "./network/LanCandidateIpService";
import { DiscoveryResult } from "./network/LanDiscoveryStrategy";
import {
  broadcastPacket, clearAllListeners, handleIncomingPacket,
  sendPacketToHost, setSessionHostIp, startHeartbeat, subscribeToPackets,
  cleanupAllReconnectionTimers,
} from "./lanGameService";
import { HeartbeatService } from "./network/HeartbeatService";
import { GameSessionTransport } from "./network/GameSessionTransport";
import { logLanDebug, updateDebugMetric } from "./observability/DebugService";
import { buildJoinPacket } from "./network/LobbyDataHelpers";
import { handleLobbyPacket, LobbyPacketDeps } from "./network/LobbyPacketHandler";
import { isLobbyPresenceToastAllowed } from "./network/LobbyToastVisibility";
import { startIpDetectionLoop } from "./HostIpDetector";

// ── Module state ──
let unsubscribeNetInfo: (() => void) | null = null;
let unsubscribePackets: (() => void) | null = null;
/** Prevents duplicate stopCoordinator invocations during rapid leave/join */
let isStopping = false;
let joinRetryInterval: ReturnType<typeof setInterval> | null = null;
let joinTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingHostLobbyPromise: Promise<any> | null = null;
const announcedPlayerIds = new Set<string>();
const botAnnouncementTimers: ReturnType<typeof setTimeout>[] = [];

// ── Helpers ──
const clearJoinAttempts = () => {
  if (joinRetryInterval) { clearInterval(joinRetryInterval); joinRetryInterval = null; }
  if (joinTimeout) { clearTimeout(joinTimeout); joinTimeout = null; }
};

const broadcastPlayerList = (players: SessionPlayer[]) => {
  broadcastPacket({ type: NETWORK.PLAYER_LIST_UPDATE, players, lobbyStage: store.getState().session.lobbyStage }, { processLocally: false });
};

const syncPlayerListLocally = (players: SessionPlayer[]) => {
  store.dispatch(setLobbyPlayers(players.slice(0, 4)));
};

const buildJoinPacketFromState = () => buildJoinPacket(store.getState().session, store.getState().wallet.coins);

// Dependency injection for packet handler
const packetDeps: LobbyPacketDeps = {
  syncPlayerListLocally, broadcastPlayerList, clearJoinAttempts,
  leaveLanLobby: () => leaveLanLobby(),
  announcedPlayerIds,
};

const ensurePacketSubscription = () => {
  if (unsubscribePackets) { unsubscribePackets(); unsubscribePackets = null; }
  clearAllListeners();
  unsubscribePackets = subscribeToPackets((packet, sourceIp) => handleLobbyPacket(packet, sourceIp, packetDeps));
};

const stopCoordinator = async () => {
  if (isStopping) {
    console.log("[TCP_DEBUG] STOP_COORDINATOR skipped=already_stopping");
    return;
  }
  isStopping = true;
  console.log("[TCP_DEBUG] STOP_COORDINATOR_START");

  clearJoinAttempts();
  botAnnouncementTimers.forEach(t => clearTimeout(t));
  botAnnouncementTimers.length = 0;
  announcedPlayerIds.clear();
  if (unsubscribePackets) { unsubscribePackets(); unsubscribePackets = null; }
  if (unsubscribeNetInfo) { unsubscribeNetInfo(); unsubscribeNetInfo = null; }
  
  // ── RECONNECT CLEANUP ──
  cleanupAllReconnectionTimers();

  // CRITICAL: Stop heartbeat BEFORE transport to prevent write-after-destroy
  HeartbeatService.stop();
  await GameSessionTransport.stop();
  await LanDiscoveryService.stopBroadcasting();
  LanDiscoveryService.stopListening();

  isStopping = false;
  console.log("[TCP_DEBUG] STOP_COORDINATOR_DONE");
};

// ── Public API ──

export const initHostLobby = ({ localPlayerId, name, avatarId, coins, gameType }: {
  localPlayerId: string; name: string; avatarId: number; coins: number; gameType: string;
}) => {
  const players = createInitialLobbyPlayers({ id: localPlayerId, name, avatarId, coins });
  store.dispatch(configureSessionState({ isHost: true, localPlayerId, gameType }));
  store.dispatch(setLobbyPlayers(players));
  store.dispatch(setLobbyStage("room"));
  store.dispatch(setConnectionStatus("IDLE"));
  store.dispatch(setSessionError(null));

  const botNames = players.filter(p => p.isBot).map(p => p.name);
  if (botNames.length > 0) {
    const list = botNames.length > 2 
      ? `${botNames.slice(0, 2).join(", ")}, and ${botNames.length - 2} other`
      : botNames.join(" and ");
    
    botAnnouncementTimers.push(setTimeout(() => {
      const session = store.getState().session;
      if (isLobbyPresenceToastAllowed(session)) {
        toast.info(`${list} joined the room!`);
      }
    }, 1500));
  }
};

export const hostLanLobby = async ({ localPlayerId, name, avatarId, coins, gameType }: {
  localPlayerId: string; name: string; avatarId: number; coins: number; gameType: string;
}) => {
  if (pendingHostLobbyPromise) return pendingHostLobbyPromise;

  const existing = store.getState().session;
  if (existing.isHost && existing.connectionStatus === "HOSTING" && GameSessionTransport.getSnapshot().isHost) {
    return { hostIp: existing.hostIp, roomCode: existing.roomCode, players: existing.players };
  }

  pendingHostLobbyPromise = (async () => {
    // Use a placeholder initially; HostIpDetector will calculate it from the IP
    const roomCode = "000"; 
    ensurePacketSubscription();

    await GameSessionTransport.start({ isHost: true, localPlayerId, onPacket: (p, ip) => handleIncomingPacket(p, ip) });
    const port = GameSessionTransport.getListeningPort();

    store.dispatch(setConnectionStatus("HOSTING"));
    store.dispatch(setSessionError(null));

    // Start async IP detection (returns cleanup fn)
    const cleanupIpDetection = startIpDetectionLoop({ roomCode, actualPort: port, hostName: name, lobbyId: localPlayerId });
    if (cleanupIpDetection) unsubscribeNetInfo = cleanupIpDetection;

    startHeartbeat(true);
    return { hostIp: null, roomCode: null, players: store.getState().session.players, port };
  })();

  try { return await pendingHostLobbyPromise; } finally { pendingHostLobbyPromise = null; }
};

export const joinLanLobby = async ({ hostIp, hostPort, candidateIps = [], roomCode, localPlayerId, name, avatarId, coins, gameType }: {
  hostIp: string; hostPort?: number; candidateIps?: string[]; roomCode?: string | null;
  localPlayerId: string; name: string; avatarId: number; coins: number; gameType: string;
}) => {
  await stopCoordinator();
  ensurePacketSubscription();
  const actualPort = hostPort || NETWORK.TCP_SERVER_PORT;

  // FIX: Initialize transport for client BEFORE connecting.
  // Without this, packetHandler stays null (cleared by stopCoordinator→stop())
  // and the client silently drops ALL incoming packets from host.
  await GameSessionTransport.start({
    isHost: false,
    localPlayerId,
    hostIp,
    hostPort: actualPort,
    onPacket: (p, ip) => handleIncomingPacket(p, ip),
  });

  const allCandidates = Array.from(new Set([...(hostIp ? [hostIp] : []), ...candidateIps, ...LanCandidateIpService.getCommonGateways()]));
  const portsToTry = hostPort ? [hostPort] : [NETWORK.TCP_SERVER_PORT, 41236, 41237, 41238, 41239, 41240];
  let connectedIp: string | null = null;
  let finalPort = NETWORK.TCP_SERVER_PORT;

  const startSessionId = GameSessionTransport.getCurrentSessionId();

  for (const ip of allCandidates) {
    for (const port of portsToTry) {
      // PROD-SAFE GUARD: Abort if a new session started or coordinator stopped
      if (GameSessionTransport.getCurrentSessionId() !== startSessionId || isStopping) {
        console.log("[LobbyCoordinator] Aborting join loop: session changed or stopping");
        return;
      }

      try {
        await GameSessionTransport.connectAsync(ip, port);
        connectedIp = ip;
        finalPort = port;
        break;
      } catch {
        /* try next port/ip */
      }
    }
    if (connectedIp) break;
  }

  if (!connectedIp) {
    store.dispatch(setConnectionStatus("ERROR"));
    store.dispatch(setSessionError("Make sure all players are connected to the same hotspot or same WiFi router."));
    return;
  }

  store.dispatch(configureSessionState({ isHost: false, localPlayerId, gameType }));
  store.dispatch(setLocalSessionIdentity({ localPlayerId, name, avatarId }));
  store.dispatch(setSessionNetworkInfo({
    hostIp: connectedIp,
    roomCode: roomCode || encodeRoomCode(connectedIp, finalPort)
  }));
  store.dispatch(setLobbyPlayers([]));
  store.dispatch(setConnectionStatus("CONNECTING"));
  store.dispatch(setSessionError(null));
  store.dispatch(setLobbyStage("room"));
  setSessionHostIp(connectedIp, finalPort);

  clearJoinAttempts();

  const sendJoin = () => {
    const s = store.getState().session;
    if (s.connectionStatus !== "CONNECTING" && s.connectionStatus !== "CONNECTED") { clearJoinAttempts(); return; }
    // FIX-6: Don't resend PLAYER_JOIN if we're already confirmed in the player list
    const alreadyInList = s.players.some(p => p.id === localPlayerId);
    if (alreadyInList) {
      if (__DEV__) console.log("[LobbyCoordinator] PLAYER_JOIN send skipped: already in player list");
      clearJoinAttempts();
      return;
    }
    const pkt = buildJoinPacketFromState();
    if (pkt) sendPacketToHost(pkt);
  };

  setTimeout(sendJoin, 100);
  startHeartbeat(false);

  // FIX-6: Retry only until confirmed in player list or status is CONNECTED
  joinRetryInterval = setInterval(() => {
    const s = store.getState().session;
    const inList = s.players.some(p => p.id === localPlayerId);
    if (inList || s.connectionStatus === "CONNECTED") {
      if (__DEV__) console.log(`[LobbyCoordinator] Join retry stopped (inList=${inList}, status=${s.connectionStatus})`);
      if (joinRetryInterval) { clearInterval(joinRetryInterval); joinRetryInterval = null; }
    } else if (s.connectionStatus === "CONNECTING") {
      console.log("[LobbyCoordinator] Retrying PLAYER_JOIN...");
      sendJoin();
    } else {
      clearJoinAttempts();
    }
  }, 2000);

  joinTimeout = setTimeout(() => {
    if (store.getState().session.connectionStatus === "CONNECTING") {
      clearJoinAttempts();
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(setSessionError("Make sure all players are connected to the same hotspot or same WiFi router."));
    }
  }, 10000);
};

export const syncLocalLobbyProfile = ({ name, avatarId, coins }: { name?: string; avatarId?: number; coins?: number }) => {
  const s = store.getState().session;
  const localPlayer = s.players.find(p => p.id === s.localPlayerId);
  
  const targetName = name?.trim() || s.localPlayerName;
  const targetAvatarId = avatarId !== undefined ? avatarId : s.localAvatarId;
  const targetCoins = coins !== undefined ? coins : store.getState().wallet.coins;

  const nameChanged = targetName !== localPlayer?.name;
  const avatarChanged = targetAvatarId !== localPlayer?.avatarId;
  const coinsChanged = targetCoins !== localPlayer?.coins;

  if (!nameChanged && !avatarChanged && !coinsChanged && s.connectionStatus !== "IDLE") {
    return;
  }

  // 1. INSTANT LOCAL UPDATE: Update Redux state immediately for a "goated" feel
  store.dispatch(setLocalSessionIdentity({ name: targetName, avatarId: targetAvatarId }));
  
  // Optimistically update the local player list for BOTH host and client
  const idx = s.players.findIndex(p => p.id === s.localPlayerId);
  let nextPlayers = s.players;
  if (idx >= 0) {
    const cur = s.players[idx];
    const next = { ...cur, name: targetName, avatarId: targetAvatarId, coins: targetCoins };
    nextPlayers = [...s.players]; 
    nextPlayers[idx] = next;
    syncPlayerListLocally(nextPlayers); 
  }

  if (s.isHost) {
    // 2. DEBOUNCED BROADCAST: Host tells everyone else
    if (idx >= 0) {
      clearTimeout((syncLocalLobbyProfile as any).broadcastTimer);
      (syncLocalLobbyProfile as any).broadcastTimer = setTimeout(() => {
        broadcastPlayerList(nextPlayers);
      }, 500);
    }
    return;
  }

  // Client side: Debounce the JOIN packet to tell the host
  if (s.connectionStatus === "CONNECTED" || s.connectionStatus === "CONNECTING") {
    clearTimeout((syncLocalLobbyProfile as any).broadcastTimer);
    (syncLocalLobbyProfile as any).broadcastTimer = setTimeout(() => {
      const pkt = buildJoinPacketFromState(); 
      if (pkt) sendPacketToHost(pkt);
    }, 500);
  }
};

export const leaveLanLobby = async () => {
  clearJoinAttempts();
  const s = store.getState().session;
  // Only send leave packet if transport is still open
  if (!s.isHost && s.localPlayerId && !GameSessionTransport.isClosing) {
    try {
      sendPacketToHost({ type: NETWORK.PLAYER_LEAVE, playerId: s.localPlayerId, reason: "player_quit" });
    } catch (e) {
      console.warn("[TCP_DEBUG] LEAVE_PACKET_FAILED", e);
    }
  }
  await stopCoordinator();
  store.dispatch(clearSession());
};

export { getCandidateIpsForRoomCode } from "@/utils/roomCode";
export const startLanDiscovery = (onDiscovery: (result: DiscoveryResult) => void) => LanDiscoveryService.startListening(onDiscovery);
export const stopLanDiscovery = () => LanDiscoveryService.stopListening();
