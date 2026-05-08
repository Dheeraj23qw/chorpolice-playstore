import { NETWORK } from "../constants/Networking";
import { PacketRouter } from "@/service/PacketRouter";
import { updateDebugMetric, logLanDebug } from "./observability/DebugService";
import { HeartbeatService } from "./network/HeartbeatService";
import { GameSessionTransport } from "./network/GameSessionTransport";
import { isLobbyPresenceToastAllowed } from "./network/LobbyToastVisibility";
import store from "@/redux/store";
import { 
  setPlayerConnectionStatus, 
  setLocalReconnecting, 
  tickReconnectTimeout,
  clearSession
} from "@/redux/reducers/sessionSlice";
import { ChorPoliceEngine } from "./ChorPoliceEngine";
import { QuizEngine } from "./QuizEngine";
import { toast } from "@/components/feedback/toast";
import NetInfo from "@react-native-community/netinfo";
import { registerIncomingPacketHandler, notifyGenericListeners } from "@/service/packetDispatcher";
import { 
  startReconnectWindow, 
  resolveReconnectSuccess, 
  resolveReconnectFailed, 
  clearReconnectState,
  ReconnectReason
} from "@/redux/reducers/reconnectSlice";
import { refundCoins, forfeitCoins } from "@/features/wallet/walletSlice";
import { router } from "expo-router";

const reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
const reconnectIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
let unsubscribeNetInfo: (() => void) | null = null;

// 🔥 IDEMPOTENT SETTLEMENT LEDGER: Ensures coins are only settled once per match
interface SettlementRecord {
  settled: boolean;
  settlementType: "completed" | "dismissed_reconnect_failed";
  faultyPlayerId?: string;
  refundedPlayerIds: string[];
  penalizedPlayerIds: string[];
}
const matchSettlementLedger: Record<string, SettlementRecord> = {};

/**
 * Force clear all pending reconnection timers and intervals.
 * Critical for preventing stale timeouts after match end or host leave.
 */
export const cleanupAllReconnectionTimers = () => {
  console.log(`🧹 [LAN] Cleaning up ${reconnectTimers.size} reconnection timers.`);
  reconnectTimers.forEach(clearTimeout);
  reconnectTimers.clear();
  reconnectIntervals.forEach(clearInterval);
  reconnectIntervals.clear();
};


type PacketListener = (packet: any, sourceIp?: string) => void;

const listeners: Set<PacketListener> = new Set();

const debugLogger = (role: string, packet: any, metadata: string = "N/A") => {
  if (!__DEV__) {
    return;
  }

  const timestamp = new Date().toISOString();
  const summary = JSON.stringify(packet).substring(0, 100);
  console.log(
    `[DEBUG][${timestamp}][${role}][${packet.type}][${summary}] - Meta: ${metadata}`,
  );
};

const notifyListeners = (packet: any, sourceIp?: string) => {
  listeners.forEach((listener) => {
    try {
      listener(packet, sourceIp);
    } catch (e) {
      if (__DEV__) console.log("[LAN] Listener error:", e);
    }
  });
};

PacketRouter.setBroadcastHandler((packet) => {
  handleIncomingPacket(packet);

  if (GameSessionTransport.getSnapshot().isHost && !GameSessionTransport.isClosing) {
    GameSessionTransport.sendToClients(packet);
  }
});

export const subscribeToPackets = (listener: PacketListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const clearAllListeners = () => {
  console.log(`🧹 [LAN] Clearing ${listeners.size} stale packet listeners.`);
  listeners.clear();
};

const configureSession = ({
  isHost,
  localPlayerId,
  hostIp = null,
}: {
  isHost: boolean;
  localPlayerId: string;
  hostIp?: string | null;
}) => {
  GameSessionTransport.start({
    isHost,
    localPlayerId,
    hostIp,
    onPacket: (packet, sourceIp) => handleIncomingPacket(packet, sourceIp),
  });
};

export const setSessionHostIp = (hostIp: string | null, hostPort?: number) => {
  GameSessionTransport.setHostIp(hostIp, hostPort);
};

export const getSessionContext = () => GameSessionTransport.getSnapshot();

export const registerRemotePeer = (playerId: string, sourceIp?: string) => {
  if (!sourceIp || !GameSessionTransport.getSnapshot().isHost) {
    return;
  }

  GameSessionTransport.registerPeer(playerId, sourceIp);
  HeartbeatService.addClient(sourceIp);
};

export const unregisterRemotePeer = (playerId: string) => {
  const peerIp = GameSessionTransport.getIpByPlayerId(playerId);
  if (peerIp) {
    HeartbeatService.removeClient(peerIp);
  }
  GameSessionTransport.unregisterPeer(playerId);
};

export const sendPacketToHost = (packet: any) => {
  if (GameSessionTransport.isClosing) return;
  GameSessionTransport.sendToHost(packet);
};

export const sendPacketToPeer = (ip: string, packet: any) => {
  if (GameSessionTransport.isClosing) return;
  GameSessionTransport.sendToPeer(ip, packet);
};

export const broadcastPacket = (
  packet: any,
  options: { processLocally?: boolean } = {},
) => {
  const { processLocally = true } = options;

  if (processLocally) {
    handleIncomingPacket(packet);
  }

  if (GameSessionTransport.getSnapshot().isHost && !GameSessionTransport.isClosing) {
    GameSessionTransport.sendToClients(packet);
  }
};

/**
 * Client-side: Attempt to reconnect to the host.
 */
export const reconnectToHost = async (hostIp: string, playerId: string) => {
  if (GameSessionTransport.isClosing) return;
  
  console.log(`📡 [LAN] Attempting reconnection to ${hostIp} for ${playerId}...`);
  
  try {
    // 1. Re-initialize transport as client
    await GameSessionTransport.start({
      isHost: false,
      localPlayerId: playerId,
      hostIp,
      onPacket: (packet, sourceIp) => handleIncomingPacket(packet, sourceIp),
    });

    // 2. Send RECONNECT_REQUEST with hardened identity
    const state = store.getState().session;
    GameSessionTransport.sendToHost({
      type: NETWORK.RECONNECT_REQUEST,
      playerId,
      sessionToken: state.sessionToken,
      roomCode: state.roomCode,
      deviceId: state.deviceId,
      sessionId: GameSessionTransport.getCurrentSessionId(),
    });

    // 3. Restart heartbeat
    startHeartbeat(false);
  } catch (e) {
    console.warn("📡 [LAN] Reconnection attempt failed:", e);
  }
};



/**
 * CRITICAL: Stop heartbeat FIRST, then stop transport.
 * This ordering prevents heartbeat from attempting to write to destroyed sockets.
 */
export const stopSession = async () => {
  console.log("[TCP_DEBUG] STOP_SESSION_START");
  cleanupAllReconnectionTimers();
  HeartbeatService.stop();
  if (unsubscribeNetInfo) {
    unsubscribeNetInfo();
    unsubscribeNetInfo = null;
  }
  await GameSessionTransport.stop();
  console.log("[TCP_DEBUG] STOP_SESSION_DONE");
};

/**
 * 🔥 POST-MATCH TRANSPORT-ONLY CLEANUP
 * 
 * Shuts down all LAN networking (heartbeat, TCP, listeners, reconnect timers)
 * WITHOUT clearing Redux result/score data.
 * 
 * Idempotent: safe to call multiple times from different triggers
 * (final result dispatch, screen unmount, back press, etc.)
 * 
 * @param opts.reason - Why cleanup is happening (for debug logs)
 * @param opts.preserveResult - Must be true; exists as a safety contract
 */
let isMatchCleaningUp = false;
export const cleanupAfterMatchCompleted = async (opts: {
  reason: string;
  preserveResult?: boolean;
} = { reason: "completed" }) => {
  // ── IDEMPOTENCY GUARD ──
  if (isMatchCleaningUp) {
    console.log(`[CP][LAN] Cleanup already in progress, skipping duplicate (reason=${opts.reason})`);
    return;
  }
  isMatchCleaningUp = true;

  console.log(`[CP][LAN] Final result reached, cleaning sockets (reason=${opts.reason})`);

  try {
    // 1. Stop heartbeat first to prevent writes to dead sockets
    HeartbeatService.stop();
    console.log("[CP][LAN] Heartbeat stopped");

    // 2. Clear all reconnection timers/intervals
    cleanupAllReconnectionTimers();
    console.log("[CP][LAN] Reconnect timers cleared");

    // 3. Unsubscribe NetInfo listener (host-side network monitoring)
    if (unsubscribeNetInfo) {
      unsubscribeNetInfo();
      unsubscribeNetInfo = null;
    }

    // 4. Clear all packet listeners (no more incoming packet processing)
    clearAllListeners();
    console.log("[CP][LAN] Packet listeners cleared");

    // 5. Clear reconnect overlay state (if somehow still active)
    store.dispatch(clearReconnectState());

    // 6. Destroy TCP transport (client socket + server if host)
    await GameSessionTransport.stop();
    console.log("[CP][LAN] TCP transport stopped");

    // NOTE: We do NOT dispatch clearSession() here.
    // Redux result data (scores, leaderboard, economy) must survive
    // so that FinalResultView can render correctly.

    console.log("[CP][LAN] Cleanup complete");
  } catch (e) {
    console.warn("[CP][LAN] Cleanup error (non-fatal):", e);
  } finally {
    // Reset the guard after a brief delay to allow any trailing calls to be caught
    setTimeout(() => { isMatchCleaningUp = false; }, 2000);
  }
};

export const markMatchSettledLocally = (matchId: string) => {
  if (!matchId) return;
  matchSettlementLedger[matchId] = {
    settled: true,
    settlementType: "completed",
    refundedPlayerIds: [],
    penalizedPlayerIds: [],
  };
};

// Re-export from leaf module to avoid breaking existing consumers
import { normalizePeerIp } from "./network/normalizePeerIp";
export { normalizePeerIp };

export const handleIncomingPacket = (packet: any, rawSourceIp?: string) => {
  if (__DEV__) {
    console.log(`🌐 [LAN] handleIncomingPacket: type=${packet?.type} source=${rawSourceIp || "LOCAL"}`);
  }
  if (GameSessionTransport.isClosing) {
    if (__DEV__) {
      console.log(`🌐 [LAN] Packet dropped: Transport is closing. type=${packet?.type}`);
    }
    return;
  }

  const sourceIp = normalizePeerIp(rawSourceIp);
  if (!packet || typeof packet !== "object" || !packet.type) {
    if (__DEV__) {
      console.warn("⚠️ [Network] Received malformed or empty packet. Ignoring.", packet);
    }
    return;
  }


  debugLogger("RECEIVER", packet, sourceIp || "LOCAL");
  updateDebugMetric("lastPacketType", packet.type);

  if (sourceIp) {
    // FIX-3: Reset heartbeat on EVERY valid app-protocol packet
    if (__DEV__ && (packet.type === NETWORK.PING || packet.type === NETWORK.PONG)) {
      // Only log PING/PONG at debug level to avoid log spam
    } else if (__DEV__) {
      console.log(`[Heartbeat] Reset tracker for peerIp=${sourceIp} (packet: ${packet.type})`);
    }
    HeartbeatService.resetTracker(sourceIp);
  }

  if (packet.type === NETWORK.PING) {
    notifyListeners(packet, sourceIp);
    if (sourceIp && !GameSessionTransport.isClosing) {
      GameSessionTransport.sendToPeer(sourceIp, {
        type: NETWORK.PONG,
        timestamp: packet.timestamp,
      });
    }
    return;
  }

  if (packet.type === NETWORK.PONG) {
    notifyListeners(packet, sourceIp);
    const now = Date.now();
    updateDebugMetric("latency", now - (packet.timestamp || now));
    return;
  }

  if (
    packet.type === NETWORK.PLAYER_LEAVE &&
    packet.playerId &&
    GameSessionTransport.getSnapshot().isHost
  ) {
    // 🔥 Clear any active reconnection window for this player
    if (reconnectTimers.has(packet.playerId)) {
      clearTimeout(reconnectTimers.get(packet.playerId));
      reconnectTimers.delete(packet.playerId);
    }
    if (reconnectIntervals.has(packet.playerId)) {
      clearInterval(reconnectIntervals.get(packet.playerId));
      reconnectIntervals.delete(packet.playerId);
    }
    
    unregisterRemotePeer(packet.playerId);
  }

  // ── RECONNECT HANDLING ──

  if (packet.type === NETWORK.RECONNECT_REQUEST) {
    const isHost = GameSessionTransport.getSnapshot().isHost;
    if (isHost && sourceIp) {
      const { playerId, sessionToken, roomCode, deviceId } = packet;
      const state = store.getState().session;

      console.log(`📡 [LAN] Validation check for ${playerId} from ${sourceIp}`);

      // 1. Validation Logic
      const player = state.players.find(p => p.id === playerId);
      
      const isRoomValid = roomCode === state.roomCode;
      const isMatchValid = !packet.matchId || packet.matchId === state.economy.matchId;
      const windowOpen = reconnectTimers.has(playerId); 
      const playerExists = !!player;
      const tokenMatches = player?.sessionToken === sessionToken;
      const deviceMatches = !player?.deviceId || player.deviceId === deviceId;
      const statusAllows = player?.connectionStatus === "RECONNECTING" || player?.connectionStatus === "DISCONNECTED";

      if (!isRoomValid || !isMatchValid || !windowOpen || !playerExists || !tokenMatches || !deviceMatches || !statusAllows) {
        console.warn(`📡 [LAN] Rejecting reconnect for ${playerId}: room=${isRoomValid}, match=${isMatchValid}, window=${windowOpen}, status=${player?.connectionStatus}`);
        
        GameSessionTransport.sendToPeer(sourceIp, {
          type: NETWORK.RECONNECT_FAIL,
          reason: !isRoomValid ? "wrong_room" : !windowOpen ? "timeout" : "invalid_identity"
        });
        return;
      }

      console.log(`✅ [LAN] Reconnect validated for ${playerId}`);
      
      // Clear any pending bot replacement timers
      if (reconnectTimers.has(playerId)) {
        clearTimeout(reconnectTimers.get(playerId));
        reconnectTimers.delete(playerId);
      }
      if (reconnectIntervals.has(playerId)) {
        clearInterval(reconnectIntervals.get(playerId));
        reconnectIntervals.delete(playerId);
      }

      // Register the new IP for this playerId
      GameSessionTransport.registerPeer(playerId, sourceIp);
      HeartbeatService.addClient(sourceIp);

      // Store the session token locally in Redux for this player
      store.dispatch(setPlayerConnectionStatus({ playerId, status: "CONNECTED" }));

      // 🔥 CHESS.COM STYLE: Notify everyone to clear the overlay
      const resumePacket = {
        type: NETWORK.PLAYER_RECONNECTED,
        matchId: state.economy.matchId || ChorPoliceEngine.state.matchId,
        playerId
      };
      handleIncomingPacket(resumePacket); // Clear host overlay
      broadcastPacket(resumePacket, { processLocally: false }); // Clear client overlays

      // Broadcast legacy status for older components
      broadcastPacket({
        type: "RECONNECT_STATUS",
        playerId,
        status: "CONNECTED"
      });

      broadcastPacket({
        type: NETWORK.RECONNECT_SUCCESS,
        playerId,
      });

      // Send FULL state sync
      const syncPacket = {
        type: NETWORK.SYNC_STATE,
        roomCode: state.roomCode,
        players: state.players,
        currentRound: state.currentRound,
        totalRounds: state.totalRounds,
        roles: state.roles,
        policeIndex: state.policeIndex,
        kingIndex: state.kingIndex,
        thiefIndex: state.thiefIndex,
        advisorIndex: state.advisorIndex,
        isRoundActive: state.isRoundActive,
        stake: state.stake,
        scores: ChorPoliceEngine.state.scores,
        gamePhase: state.gamePhase,
        quizState: QuizEngine.state,
      };
      
      GameSessionTransport.sendToPeer(sourceIp, syncPacket);
      if (isLobbyPresenceToastAllowed(state)) {
        toast.info("Player reconnected", `${player?.name} joined back.`);
      }
    }
    return;
  }

  if (packet.type === NETWORK.RECONNECT_SUCCESS) {
    const localId = store.getState().session.localPlayerId;
    if (packet.playerId === localId) {
      console.log("✅ [LAN] Successfully reconnected to host!");
      store.dispatch(setLocalReconnecting({ isReconnecting: false }));
      toast.success("Reconnected", "Connection restored.");
    }
    return;
  }

  if (packet.type === NETWORK.RECONNECT_FAIL) {
    const localId = store.getState().session.localPlayerId;
    console.warn(`📡 [LAN] Reconnection FAILED: ${packet.reason}`);
    store.dispatch(setLocalReconnecting({ isReconnecting: false }));
    toast.error("Reconnection Rejected", packet.reason || "Validation failed.");
    return;
  }

  if (packet.type === NETWORK.SYNC_STATE) {
    const state = store.getState().session;
    const isHost = GameSessionTransport.getSnapshot().isHost;
    
    // Only clients should accept SYNC_STATE
    if (isHost) return;

    // Verify source IP matches known hostIp
    if (sourceIp !== state.hostIp) {
      console.warn(`📡 [LAN] Ignoring SYNC_STATE from non-host IP: ${sourceIp}`);
      return;
    }

    // Verify room code
    if (packet.roomCode && state.roomCode && packet.roomCode !== state.roomCode) {
      console.warn(`📡 [LAN] Ignoring SYNC_STATE for wrong room: ${packet.roomCode}`);
      return;
    }
    
    console.log("🔄 [LAN] Authoritative state sync accepted from host.");
  }

  if (packet.type === "RECONNECT_STATUS") {
    store.dispatch(setPlayerConnectionStatus({ playerId: packet.playerId, status: packet.status }));
    return;
  }

  // ── CHESS.COM STYLE RECONNECT PACKETS ──

  if (packet.type === NETWORK.PLAYER_RECONNECTING) {
    const { disconnectedPlayerId, disconnectedPlayerName, disconnectedPlayerAvatar, deadlineAt, reason, matchId } = packet;
    console.log(`[RECONNECT] start player=${disconnectedPlayerName} reason=${reason} deadlineAt=${deadlineAt}`);
    
    store.dispatch(startReconnectWindow({
      disconnectedPlayerId,
      disconnectedPlayerName,
      disconnectedPlayerAvatar,
      deadlineAt,
      reason,
      matchId
    }));
    return;
  }

  if (packet.type === NETWORK.PLAYER_RECONNECTED) {
    console.log(`[RECONNECT] success resume matchId=${packet.matchId} for player=${packet.playerId}`);
    store.dispatch(resolveReconnectSuccess());
    return;
  }

  if (packet.type === NETWORK.RECONNECT_FAILED_MATCH_DISMISSED) {
    const { matchId, faultyPlayerId, faultyPlayerName, coinPolicy } = packet;
    console.log(`[RECONNECT] failed timeout faultyPlayer=${faultyPlayerName}`);
    
    const economy = store.getState().session.economy;
    if (economy.matchId === matchId && economy.settlementStatus === "SETTLED") {
      console.log("[CP][MONEY] Abnormal dismissal ignored: match already settled");
      logLanDebug("[CP][LAN] Final result wins over reconnect failure");
      cleanupAllReconnectionTimers?.();
      return;
    }

    store.dispatch(resolveReconnectFailed());
    
    // Handle settlement locally for this client
    if (matchId && !matchSettlementLedger[matchId]?.settled) {
      const localId = store.getState().session.localPlayerId;
      if (localId === faultyPlayerId) {
        const state = store.getState().session;
        const stakeDebited = state.economy.stakeDebited;
        const stakeAmount = state.economy.stakeAmount || state.stake;
        if (coinPolicy.forfeitFaultyPlayerStake && !stakeDebited) {
          console.log(`[RECONNECT] settlement forfeit player=${localId} amount=${stakeAmount}`);
          store.dispatch(forfeitCoins(stakeAmount));
        } else {
          console.log(`[RECONNECT] settlement skip_forfeit (already debited) player=${localId}`);
        }
      } else if (coinPolicy.refundInnocentPlayers) {
        const state = store.getState().session;
        const stakeDebited = state.economy.stakeDebited;
        const stakeAmount = state.economy.stakeAmount || state.stake;
        if (stakeDebited) {
          console.log(`[RECONNECT] settlement refund player=${localId} amount=${stakeAmount}`);
          store.dispatch(refundCoins(stakeAmount));
          // 🔥 Add the requested "Safe Money" toast
          toast.success("Your Money is Safe", `Stake of ${stakeAmount} coins has been refunded to your wallet.`);
        } else {
          console.log(`[RECONNECT] settlement skip_refund (not debited) player=${localId}`);
        }
      }
      
      matchSettlementLedger[matchId] = {
        settled: true,
        settlementType: "dismissed_reconnect_failed",
        faultyPlayerId,
        refundedPlayerIds: localId !== faultyPlayerId ? [localId!] : [],
        penalizedPlayerIds: localId === faultyPlayerId ? [localId!] : []
      };
    }

    toast.error("Match Dismissed", `${faultyPlayerName} failed to reconnect.`);
    
    setTimeout(() => {
      console.log("[RECONNECT] cleanup complete");
      store.dispatch(clearReconnectState());
      store.dispatch(clearSession());
      router.replace("/mode-select");
    }, 3000);
    return;
  }

  notifyListeners(packet, sourceIp);
  if (__DEV__) {
    console.log(`🌐 [LAN] HANDOFF TO ROUTER: ${packet.type}`);
  }
  PacketRouter.route(packet, sourceIp);
  
  // 🛡️ Dispatch to decoupled listeners (e.g. Bots)
  notifyGenericListeners(packet, sourceIp);
};

// 🖇️ Register this handler to the dispatcher bridge
registerIncomingPacketHandler(handleIncomingPacket);

let apIsolationCallback: (() => void) | null = null;

export const setApIsolationHandler = (handler: (() => void) | null) => {
  apIsolationCallback = handler;
};

export const startHeartbeat = (isHost: boolean) => {
  const context = GameSessionTransport.getSnapshot();
  console.log(`[TCP_DEBUG] HEARTBEAT_INIT isHost=${isHost}`);
  
  HeartbeatService.start({
    onPing: (packet) => {
      const phase = store.getState().session.gamePhase;
      // Guard: don't send pings if transport is closing or match is concluded
      if (GameSessionTransport.isClosing || phase === "final_result" || phase === "finished") {
        if (__DEV__) console.log(`[TCP] heartbeat skipped: phase=${phase}`);
        return;
      }

      if (isHost) {
        GameSessionTransport.sendToClients(packet);
      } else if (context.hostIp) {
        // Double check liveness before host ping
        if (GameSessionTransport.isConnectedTo(context.hostIp)) {
          GameSessionTransport.sendToHost(packet);
        } else {
          if (__DEV__) console.log(`[TCP] heartbeat skipped: host socket not connected`);
        }
      }
    },
    onStale: (ip) => {
      // Guard: don't process stale events if transport is closing
      if (GameSessionTransport.isClosing) return;

      if (isHost) {
        const playerId = GameSessionTransport.getPlayerIdByIp(ip);
        if (!playerId) {
          HeartbeatService.removeClient(ip);
          return;
        }

        const phase = store.getState().session.gamePhase;
        if (phase === "idle" || phase === "finished" || phase === "final_result") {
          // Normal disconnect logic: cleanup socket but don't disrupt results UI
          unregisterRemotePeer(playerId);

          // Only broadcast/process leave if we are NOT in the final result screen.
          // Results are immutable in Redux once match concludes.
          if (phase === "idle") {
            const leavePacket = {
              type: NETWORK.PLAYER_LEAVE,
              playerId,
              reason: "heartbeat_timeout",
            };
            GameSessionTransport.sendToClients(leavePacket);
            handleIncomingPacket(leavePacket, ip);
          } else {
            if (__DEV__) console.log(`[TCP] Peer ${playerId} left during ${phase}. Ignoring UI update.`);
          }
        } else {
          // Mid-game: Trigger 60s Chess.com style reconnection window
          console.log(`📡 [LAN] Peer ${playerId} lost connection. Starting 60s recovery window.`);
          
          const s = store.getState().session;
          const player = s.players.find(p => p.id === playerId);
          const deadlineAt = Date.now() + 60000;
          const matchId = s.economy.matchId || ChorPoliceEngine.state.matchId;

          const reconnectPacket = {
            type: NETWORK.PLAYER_RECONNECTING,
            disconnectedPlayerId: playerId,
            disconnectedPlayerName: player?.name || "Player",
            disconnectedPlayerAvatar: player?.avatarId || 1,
            deadlineAt,
            reason: "heartbeat_timeout" as ReconnectReason,
            matchId
          };

          // Update host state and broadcast to everyone else
          handleIncomingPacket(reconnectPacket); // Process locally to show overlay on host
          broadcastPacket(reconnectPacket, { processLocally: false });

          // Set timeout to dismiss match
          const timer = setTimeout(() => {
            const state = store.getState().session;
            if (state.economy.settlementStatus === "SETTLED") {
              console.log("[CP][LAN] Late timeout ignored after settlement");
              reconnectTimers.delete(playerId);
              return;
            }

            console.log(`📡 [LAN] Recovery window expired for ${playerId}. Dismissing match.`);
            
            const failPacket = {
              type: NETWORK.RECONNECT_FAILED_MATCH_DISMISSED,
              matchId,
              faultyPlayerId: playerId,
              faultyPlayerName: player?.name || "Player",
              reason: "reconnect_timeout",
              coinPolicy: {
                refundInnocentPlayers: true,
                forfeitFaultyPlayerStake: true
              }
            };

            handleIncomingPacket(failPacket);
            broadcastPacket(failPacket, { processLocally: false });

            reconnectTimers.delete(playerId);
          }, 60000);

          reconnectTimers.set(playerId, timer);
        }
      } else {
        // Client side: Host is stale
        console.log(`📡 [LAN] Host at ${ip} is stale. Starting 60s reconnection overlay.`);
        
        const s = store.getState().session;
        const deadlineAt = Date.now() + 60000;
        const matchId = s.economy.matchId || ChorPoliceEngine.state.matchId;

        const reconnectPacket = {
          type: NETWORK.PLAYER_RECONNECTING,
          disconnectedPlayerId: "host",
          disconnectedPlayerName: "Host",
          disconnectedPlayerAvatar: 1,
          deadlineAt,
          reason: "host_lost" as ReconnectReason,
          matchId
        };

        handleIncomingPacket(reconnectPacket);

        const timer = setTimeout(() => {
          const state = store.getState().session;
          if (state.economy.settlementStatus === "SETTLED") {
            console.log("[CP][LAN] Late timeout ignored after settlement");
            reconnectTimers.delete("host");
            return;
          }

          console.log(`📡 [LAN] Host recovery window expired. Dismissing match locally.`);
          
          const failPacket = {
            type: NETWORK.RECONNECT_FAILED_MATCH_DISMISSED,
            matchId,
            faultyPlayerId: "host",
            faultyPlayerName: "Host",
            reason: "reconnect_timeout",
            coinPolicy: {
              refundInnocentPlayers: true,
              forfeitFaultyPlayerStake: false // Host already disconnected, client just refunds self
            }
          };

          handleIncomingPacket(failPacket);
          reconnectTimers.delete("host");
        }, 60000);

        reconnectTimers.set("host", timer);
      }
    },
    onApIsolation: () => {
      if (__DEV__) {
        console.warn("[LAN] AP Isolation detected — TCP failed on same Wi-Fi");
      }
      apIsolationCallback?.();
    },
    // FIX: Inject socket-liveness check to avoid circular import
    isConnectedTo: (ip) => GameSessionTransport.isConnectedTo(ip),
  });

  // If we are a client, immediately add the host IP to the monitor list
  if (!isHost && context.hostIp) {
    HeartbeatService.addClient(context.hostIp);
  }

  // 🔥 NEW: Monitor Host's own network connectivity via NetInfo
  if (isHost) {
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      const phase = store.getState().session.gamePhase;
      const isReconnecting = store.getState().reconnect.isActive;

      // Only trigger if we lose connection during an active match
      if (!state.isConnected && !isReconnecting && phase !== "idle" && phase !== "final_result" && phase !== "finished") {
        console.log("📡 [LAN] Host network lost. Starting self-recovery window.");
        
        const s = store.getState().session;
        const deadlineAt = Date.now() + 60000;
        const matchId = s.economy.matchId || ChorPoliceEngine.state.matchId;

        const reconnectPacket = {
          type: NETWORK.PLAYER_RECONNECTING,
          disconnectedPlayerId: "host",
          disconnectedPlayerName: "Host (Me)",
          disconnectedPlayerAvatar: s.localAvatarId || 1,
          deadlineAt,
          reason: "host_lost" as ReconnectReason,
          matchId
        };

        handleIncomingPacket(reconnectPacket);
        broadcastPacket(reconnectPacket, { processLocally: false });

        const timer = setTimeout(() => {
          if (!store.getState().reconnect.isActive) return;
          console.log("📡 [LAN] Host self-recovery window expired. Dismissing match.");
          
          const failPacket = {
            type: NETWORK.RECONNECT_FAILED_MATCH_DISMISSED,
            matchId,
            faultyPlayerId: "host",
            faultyPlayerName: "Host",
            reason: "reconnect_timeout",
            coinPolicy: {
              refundInnocentPlayers: true,
              forfeitFaultyPlayerStake: true // Host is faulty, already debited stake stays lost
            }
          };

          handleIncomingPacket(failPacket);
          broadcastPacket(failPacket, { processLocally: false });
          reconnectTimers.delete("host");
        }, 60000);

        reconnectTimers.set("host", timer);
      } else if (state.isConnected && isReconnecting) {
        // Auto-resume if connection restored
        console.log("📡 [LAN] Host network restored. Resuming match.");
        const resumePacket = { type: NETWORK.PLAYER_RECONNECTED, playerId: "host", matchId: store.getState().session.economy.matchId };
        handleIncomingPacket(resumePacket);
        broadcastPacket(resumePacket, { processLocally: false });
        if (reconnectTimers.has("host")) {
          clearTimeout(reconnectTimers.get("host"));
          reconnectTimers.delete("host");
        }
      }
    });

    unsubscribeNetInfo = unsubscribeNet;
  }
};

const stopHeartbeat = () => {
  HeartbeatService.stop();
};
