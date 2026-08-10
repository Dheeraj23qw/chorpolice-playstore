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
import { normalizePeerIp } from "./network/normalizePeerIp";
import { LanCandidateIpService } from "./network/LanCandidateIpService";
import { DiscoveryResult } from "./network/LanDiscoveryStrategy";
import {
  broadcastPacket,
  clearAllListeners,
  handleIncomingPacket,
  sendPacketToHost,
  setSessionHostIp,
  startHeartbeat,
  subscribeToPackets,
  cleanupAllReconnectionTimers,
  cleanupStaleNetworkResources,
} from "./lanGameService";
import { HeartbeatService } from "./network/HeartbeatService";
import { GameSessionTransport } from "./network/GameSessionTransport";
import { logLanDebug, updateDebugMetric } from "./observability/DebugService";
import { buildJoinPacket } from "./network/LobbyDataHelpers";
import {
  handleLobbyPacket,
  LobbyPacketDeps,
} from "./network/LobbyPacketHandler";
import { framePacket, extractFrames } from "./network/TcpFraming";
import { isLobbyPresenceToastAllowed } from "./network/LobbyToastVisibility";
import { startIpDetectionLoop } from "./HostIpDetector";

// ── Module state ──
let unsubscribeNetInfo: (() => void) | null = null;
let unsubscribePackets: (() => void) | null = null;
let stopCoordinatorPromise: Promise<void> | null = null;
let joinRetryInterval: ReturnType<typeof setInterval> | null = null;
let joinTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingHostLobbyPromise: Promise<any> | null = null;
const announcedPlayerIds = new Set<string>();
const botAnnouncementTimers: ReturnType<typeof setTimeout>[] = [];
let lobbyAnnouncementGeneration = 0;

// ── Helpers ──
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
      lobbyStage: store.getState().session.lobbyStage,
    },
    { processLocally: false },
  );
};

const syncPlayerListLocally = (players: SessionPlayer[]) => {
  store.dispatch(setLobbyPlayers(players.slice(0, 4)));
};

let pendingProfileSync = false;

const checkAndTriggerProfileSync = () => {
  const s = store.getState().session;
  const inList = s.players.some((p) => p.id === s.localPlayerId);
  if (pendingProfileSync && inList) {
    console.log("[LAN][PROFILE] Client profile sync sent after player list arrived");
    syncLocalLobbyProfile({});
    pendingProfileSync = false;
  }
};

const buildJoinPacketFromState = () =>
  buildJoinPacket(store.getState().session, store.getState().wallet.coins);

// Dependency injection for packet handler
const packetDeps: LobbyPacketDeps = {
  syncPlayerListLocally,
  broadcastPlayerList,
  clearJoinAttempts,
  leaveLanLobby: () => leaveLanLobby(),
  triggerJoin: () => {
    const s = store.getState().session;
    // Only re-join if we are actually connected to a host and not in the list
    if (!s.isHost && s.connectionStatus === "CONNECTED" && s.localPlayerId) {
      console.log(`[LAN_ORCH] [CLIENT] Self-healing re-join triggered...`);
      const pkt = buildJoinPacketFromState();
      if (pkt) sendPacketToHost(pkt);
    }
  },
  announcedPlayerIds,
  checkAndTriggerProfileSync,
};

const ensurePacketSubscription = () => {
  if (unsubscribePackets) {
    unsubscribePackets();
    unsubscribePackets = null;
  }
  clearAllListeners();
  unsubscribePackets = subscribeToPackets((packet, sourceIp) =>
    handleLobbyPacket(packet, sourceIp, packetDeps),
  );
};

const stopCoordinator = async () => {
  // If a stop is already in flight, wait for it — never skip
  if (stopCoordinatorPromise) {
    console.log("[TCP_DEBUG] STOP_COORDINATOR waiting for in-flight stop");
    await stopCoordinatorPromise;
    return;
  }

  console.log("[TCP_DEBUG] STOP_COORDINATOR_START");

  stopCoordinatorPromise = (async () => {
    clearJoinAttempts();
    pendingHostLobbyPromise = null;
    pendingProfileSync = false;
    lobbyAnnouncementGeneration += 1;
    botAnnouncementTimers.forEach((t) => clearTimeout(t));
    botAnnouncementTimers.length = 0;
    announcedPlayerIds.clear();
    if (unsubscribePackets) {
      unsubscribePackets();
      unsubscribePackets = null;
    }
    if (unsubscribeNetInfo) {
      unsubscribeNetInfo();
      unsubscribeNetInfo = null;
    }

    // ── RECONNECT CLEANUP ──
    cleanupAllReconnectionTimers();

    // CRITICAL: Stop heartbeat BEFORE transport to prevent write-after-destroy
    HeartbeatService.stop();
    await GameSessionTransport.stop();
    await LanDiscoveryService.stopBroadcasting();
    LanDiscoveryService.stopListening();

    console.log("[TCP_DEBUG] STOP_COORDINATOR_DONE");
  })().finally(() => {
    stopCoordinatorPromise = null;
  });

  await stopCoordinatorPromise;
};

// ── Public API ──

export const initHostLobby = async ({
  localPlayerId,
  name,
  avatarId,
  coins,
  gameType,
  silent = false,
}: {
  localPlayerId: string;
  name: string;
  avatarId: number;
  coins: number;
  gameType: string;
  /** Skip the "X joined the room" bot toasts (used for solo lobbies). */
  silent?: boolean;
}) => {
  const current = store.getState().session;
  // GUARD: Do not re-init if we are already connected as a client
  if (current.connectionStatus === "CONNECTED" && !current.isHost) {
    console.log(
      "[LAN_ORCH] initHostLobby skipped: already connected as client",
    );
    return;
  }

  console.log(
    `[LAN_ORCH] Initializing Host Lobby for ${localPlayerId} (${name})`,
  );

  // 🔥 FIX: Clean up any previous stale network session before becoming a Host
  await cleanupStaleNetworkResources({ reason: "host_init" });
  await LanDiscoveryService.stopBroadcasting();
  LanDiscoveryService.stopListening();

  const announcementGeneration = ++lobbyAnnouncementGeneration;
  const players = createInitialLobbyPlayers({
    id: localPlayerId,
    name,
    avatarId,
    coins,
  });
  store.dispatch(
    configureSessionState({ isHost: true, localPlayerId, gameType }),
  );
  store.dispatch(setLobbyPlayers(players));
  store.dispatch(setLobbyStage("room"));
  store.dispatch(setConnectionStatus("IDLE"));
  store.dispatch(setSessionError(null));

  const botNames = players.filter((p) => p.isBot).map((p) => p.name);
  if (botNames.length > 0 && !silent) {
    const list =
      botNames.length > 2
        ? `${botNames.slice(0, 2).join(", ")}, and ${botNames.length - 2} other`
        : botNames.join(" and ");

    botAnnouncementTimers.push(
      setTimeout(() => {
        const session = store.getState().session;
        if (
          announcementGeneration === lobbyAnnouncementGeneration &&
          isLobbyPresenceToastAllowed(session)
        ) {
          toast.info(`${list} joined the room!`);
        }
      }, 1500),
    );
  }

  // 🔥 SELF-HEALING BROADCAST: Host periodically sends authoritative list to all clients
  // This ensures that even if a JOIN or UPDATE packet was missed, the client eventually syncs.
  const periodicBroadcast = setInterval(() => {
    const s = store.getState().session;
    if (!s.isHost || s.connectionStatus !== "HOSTING") {
      clearInterval(periodicBroadcast);
      return;
    }
    console.log(
      `[LAN_ORCH] [HOST] Periodic heartbeat sync (players=${s.players.length})`,
    );
    broadcastPlayerList(s.players);
  }, 3000);
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
  if (pendingHostLobbyPromise) return pendingHostLobbyPromise;

  const existing = store.getState().session;
  if (
    existing.isHost &&
    existing.connectionStatus === "HOSTING" &&
    GameSessionTransport.getSnapshot().isHost
  ) {
    return {
      hostIp: existing.hostIp,
      roomCode: existing.roomCode,
      players: existing.players,
    };
  }

  pendingHostLobbyPromise = (async () => {
    // Use a placeholder initially; HostIpDetector will calculate it from the IP
    const roomCode = "000";
    ensurePacketSubscription();

    await GameSessionTransport.start({
      isHost: true,
      localPlayerId,
      onPacket: (p, ip) => handleIncomingPacket(p, ip),
    });
    const port = GameSessionTransport.getListeningPort();

    store.dispatch(setConnectionStatus("HOSTING"));
    store.dispatch(setSessionError(null));

    // Start async IP detection (returns cleanup fn)
    const cleanupIpDetection = startIpDetectionLoop({
      roomCode,
      actualPort: port,
      hostName: name,
      lobbyId: localPlayerId,
    });
    if (cleanupIpDetection) unsubscribeNetInfo = cleanupIpDetection;

    startHeartbeat(true);
    return {
      hostIp: null,
      roomCode: null,
      players: store.getState().session.players,
      port,
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

  const allCandidates = Array.from(
    new Set([
      ...(hostIp ? [hostIp] : []),
      ...candidateIps,
    ]),
  );
  const portsToTry = hostPort
    ? [hostPort]
    : [NETWORK.TCP_SERVER_PORT, 41236, 41237, 41238, 41239, 41240];
  let connectedIp: string | null = null;
  let finalPort = NETWORK.TCP_SERVER_PORT;

  const startSessionId = GameSessionTransport.getCurrentSessionId();
  console.log(
    `[LAN_ORCH] starting join process candidates=${allCandidates.length} room=${roomCode || "manual"}`,
  );

  let result: { ip: string; port: number; socket: any } | null = null;
  const allProbeSockets = new Set<any>();

  const probeOne = async (
    ip: string,
    port: number,
  ): Promise<{ ip: string; port: number; socket: any }> => {
    if (
      GameSessionTransport.getCurrentSessionId() !== startSessionId ||
      stopCoordinatorPromise !== null
    ) {
      throw new Error("ABORTED");
    }

    let probeSocket: any = null;
    try {
      probeSocket = await GameSessionTransport.probeAsync(ip, port, 1000);
      allProbeSockets.add(probeSocket);

      return new Promise((resolve, reject) => {
        let buffer: any = Buffer.alloc(0);
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("HANDSHAKE_TIMEOUT"));
        }, 800);

        const cleanup = () => {
          clearTimeout(timeout);
          if (probeSocket) {
            probeSocket.removeAllListeners("data");
            probeSocket.removeAllListeners("error");
            probeSocket.removeAllListeners("close");
          }
        };

        probeSocket.on("data", (data: any) => {
          try {
            const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
            buffer = Buffer.concat([buffer, raw]);
            const [packets, remaining] = extractFrames(buffer);
            buffer = remaining;

            for (const env of packets) {
              if (env.packet?.type === NETWORK.PONG) {
                console.log(
                  `[LAN_ORCH] marvel verified host at ${ip}:${port} ✓`,
                );
                cleanup();
                resolve({ ip, port, socket: probeSocket });
                return;
              }
            }
          } catch (e) {
            console.warn("[LAN_ORCH] probe data parse error", e);
          }
        });

        probeSocket.on("error", (err: any) => {
          cleanup();
          reject(err);
        });

        probeSocket.on("close", () => {
          cleanup();
          reject(new Error("CLOSED"));
        });

        if (probeSocket && !probeSocket.destroyed && probeSocket.readyState === "open") {
          try {
            probeSocket.write(
              framePacket({ type: NETWORK.PING, timestamp: Date.now() }),
            );
          } catch (e) {
            console.warn("[LAN_ORCH] probe write failed", e);
            cleanup();
            reject(e);
          }
        } else {
          cleanup();
          reject(new Error("SOCKET_NOT_READY"));
        }
      });
    } catch (e: any) {
      if (probeSocket) {
        allProbeSockets.delete(probeSocket);
        try {
          (probeSocket as any).__explicitlyDestroyed = true;
          probeSocket.destroy();
        } catch {}
      }
      if (e.message !== "ABORTED" && GameSessionTransport.getCurrentSessionId() === startSessionId) {
        console.log(`[LAN_ORCH] candidate failed ${ip}:${port} (${e.message})`);
      } else if (e.message !== "ABORTED") {
        console.log(`[LAN][JOIN] Late candidate failure ignored`);
      }
      throw e;
    }
  };

  // ── MARVEL PROBING: Staggered Batches ───────────────────────────────────────
  const localIp = store.getState().session.localIp;
  const primaryCandidates = Array.from(
    new Set([
      ...(hostIp ? [hostIp] : []),
      ...candidateIps.filter(ip => ip !== localIp)
    ]),
  );
  
  const fallbackCandidates = LanCandidateIpService.getCommonGateways().filter(
    (ip) => !primaryCandidates.includes(ip) && ip !== localIp,
  );

  const runBatch = (ips: string[]) => {
    const batchProbes: Promise<{ ip: string; port: number; socket: any }>[] =
      [];
    ips.forEach((ip) =>
      portsToTry.forEach((port) => batchProbes.push(probeOne(ip, port))),
    );
    return batchProbes;
  };

  try {
    const primaryProbes = runBatch(primaryCandidates);

    const fallbackPromise = new Promise<{
      ip: string;
      port: number;
      socket: any;
    }>((resolve, reject) => {
      setTimeout(async () => {
        if (result || stopCoordinatorPromise !== null) return;
        try {
          const res = await Promise.any(runBatch(fallbackCandidates));
          resolve(res);
        } catch (e) {
          reject(e);
        }
      }, 300);
    });

    result = await Promise.any([...primaryProbes, fallbackPromise]);
    connectedIp = result.ip;
    finalPort = result.port;

    console.log(
      `[LAN_ORCH] marvel join successful! host=${connectedIp}:${finalPort}`,
    );
  } catch (err: any) {
    if (
      err.name === "AggregateError" ||
      err.message === "All promises were rejected"
    ) {
      console.warn("[LAN_ORCH] marvel join: all candidates failed");
    } else if (err.message !== "ABORTED") {
      console.log("[LAN_ORCH] marvel join error:", err.message);
    }
  } finally {
    if (result) {
      console.log("[LAN][JOIN] Candidate attempts cancelled after success");
    }
    allProbeSockets.forEach((s) => {
      if (result && s === result.socket) return;
      try {
        (s as any).__explicitlyDestroyed = true;
        s.destroy();
      } catch {}
    });
    allProbeSockets.clear();
  }

  if (!connectedIp) {
    store.dispatch(setConnectionStatus("ERROR"));
    store.dispatch(
      setSessionError(
        "No rooms found. If you're on a public/college WiFi, they might block game connections (AP Isolation). Try using a Mobile Hotspot instead!",
      ),
    );
    return;
  }

  console.log(
    `[LAN_ORCH] join successful, initializing session with host=${connectedIp}`,
  );

  store.dispatch(
    configureSessionState({ isHost: false, localPlayerId, gameType }),
  );
  store.dispatch(setLocalSessionIdentity({ localPlayerId, name, avatarId }));
  store.dispatch(
    setSessionNetworkInfo({
      hostIp: connectedIp,
      roomCode: roomCode || encodeRoomCode(connectedIp, finalPort),
    }),
  );
  store.dispatch(setLobbyPlayers([]));
  store.dispatch(setConnectionStatus("CONNECTING"));
  store.dispatch(setSessionError(null));
  store.dispatch(setLobbyStage("room"));
  GameSessionTransport.useSocket(connectedIp, result!.socket);

  clearJoinAttempts();

  const sendJoin = () => {
    const s = store.getState().session;
    if (
      s.connectionStatus !== "CONNECTING" &&
      s.connectionStatus !== "CONNECTED"
    ) {
      clearJoinAttempts();
      return;
    }
    // FIX-6: Don't resend PLAYER_JOIN if we're already confirmed in the player list
    const alreadyInList = s.players.some((p) => p.id === localPlayerId);
    if (alreadyInList) {
      if (__DEV__)
        console.log(
          "[LobbyCoordinator] PLAYER_JOIN send skipped: already in player list",
        );
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
    const inList = s.players.some((p) => p.id === localPlayerId);
    if (inList || s.connectionStatus === "CONNECTED") {
      if (__DEV__)
        console.log(
          `[LobbyCoordinator] Join retry stopped (inList=${inList}, status=${s.connectionStatus})`,
        );
      if (joinRetryInterval) {
        clearInterval(joinRetryInterval);
        joinRetryInterval = null;
      }
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
      store.dispatch(
        setSessionError(
          "Make sure all players are connected to the same hotspot or same WiFi router.",
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
  const s = store.getState().session;
  const localPlayer = s.players.find((p) => p.id === s.localPlayerId);

  const targetName = name?.trim() || s.localPlayerName;
  const targetAvatarId = avatarId !== undefined ? avatarId : s.localAvatarId;
  const targetCoins =
    coins !== undefined ? coins : store.getState().wallet.coins;

  const nameChanged = targetName !== localPlayer?.name;
  const avatarChanged = targetAvatarId !== localPlayer?.avatarId;
  const coinsChanged = targetCoins !== localPlayer?.coins;

  if (
    !nameChanged &&
    !avatarChanged &&
    !coinsChanged &&
    s.connectionStatus !== "IDLE"
  ) {
    return;
  }

  // 1. INSTANT LOCAL UPDATE: Update Redux state immediately for a "goated" feel
  console.log(
    `[LAN_ORCH] Syncing local profile: name=${targetName} avatar=${targetAvatarId}`,
  );
  store.dispatch(
    setLocalSessionIdentity({ name: targetName, avatarId: targetAvatarId }),
  );

  // Optimistically update the local player list for BOTH host and client
  const idx = s.players.findIndex((p) => p.id === s.localPlayerId);
  let nextPlayers = s.players;
  if (idx >= 0) {
    const cur = s.players[idx];
    const next = {
      ...cur,
      name: targetName,
      avatarId: targetAvatarId,
      coins: targetCoins,
    };
    nextPlayers = [...s.players];
    nextPlayers[idx] = next;
    syncPlayerListLocally(nextPlayers);
  } else {
    // 🔥 OPTIMISTIC CLIENT SYNC: Even if not in list yet, update local identity
    // This ensures the user sees their own change immediately while waiting for host confirm.
    console.log(
      `[LAN_ORCH] Local player ${s.localPlayerId} not in list yet; updating local identity only.`,
    );
    console.log("[LAN][PROFILE] Client profile sync queued until player list arrives");
    pendingProfileSync = true;
  }

  if (s.isHost) {
    // 2. DEBOUNCED BROADCAST: Host tells everyone else
    if (idx >= 0) {
      clearTimeout((syncLocalLobbyProfile as any).broadcastTimer);
      (syncLocalLobbyProfile as any).broadcastTimer = setTimeout(() => {
        const latestPlayers = store.getState().session.players;
        console.log(
          `[LAN_ORCH] [HOST] Broadcasting live update to clients (count=${latestPlayers.length})`,
        );
        broadcastPlayerList(latestPlayers);
      }, 150); // Ultra-fast sync
    }
    return;
  }

  // Client side: Debounce the JOIN packet to tell the host
  if (
    s.connectionStatus === "CONNECTED" ||
    s.connectionStatus === "CONNECTING"
  ) {
    clearTimeout((syncLocalLobbyProfile as any).broadcastTimer);
    (syncLocalLobbyProfile as any).broadcastTimer = setTimeout(() => {
      const pkt = buildJoinPacketFromState();
      if (pkt) {
        console.log(
          `[LAN_ORCH] [CLIENT] Sending live update: name=${pkt.player.name} avatar=${pkt.player.avatarId}`,
        );
        sendPacketToHost(pkt);
      }
    }, 150); // Live feel
  }
};

export const leaveLanLobby = async () => {
  clearJoinAttempts();
  const s = store.getState().session;
  // Only send leave packet if transport is still open
  if (!s.isHost && s.localPlayerId && !GameSessionTransport.isClosing) {
    try {
      sendPacketToHost({
        type: NETWORK.PLAYER_LEAVE,
        playerId: s.localPlayerId,
        reason: "player_quit",
      });
    } catch (e) {
      console.warn("[TCP_DEBUG] LEAVE_PACKET_FAILED", e);
    }
  }
  await stopCoordinator();
  store.dispatch(clearSession());
};

export { getCandidateIpsForRoomCode } from "@/utils/roomCode";
export const startLanDiscovery = (
  onDiscovery: (result: DiscoveryResult) => void,
) => LanDiscoveryService.startListening(onDiscovery);
export const stopLanDiscovery = () => LanDiscoveryService.stopListening();
