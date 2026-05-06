import { NETWORK } from "../constants/Networking";
import { PacketRouter } from "@/service/PacketRouter";
import { updateDebugMetric } from "./observability/DebugService";
import { HeartbeatService } from "./network/HeartbeatService";
import { GameSessionTransport } from "./network/GameSessionTransport";
import store from "@/redux/store";
import { 
  setPlayerConnectionStatus, 
  setLocalReconnecting, 
  tickReconnectTimeout 
} from "@/redux/reducers/sessionSlice";
import { ChorPoliceEngine } from "./ChorPoliceEngine";
import { QuizEngine } from "./QuizEngine";
import { toast } from "@/components/feedback/toast";
import { registerIncomingPacketHandler, notifyGenericListeners } from "@/service/packetDispatcher";

const reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
const reconnectIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

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
  await GameSessionTransport.stop();
  console.log("[TCP_DEBUG] STOP_SESSION_DONE");
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
      const playerExists = !!player;
      const tokenMatches = player?.sessionToken === sessionToken;
      const deviceMatches = !player?.deviceId || player.deviceId === deviceId;
      const statusAllows = player?.connectionStatus === "RECONNECTING" || player?.connectionStatus === "DISCONNECTED";

      if (!isRoomValid || !playerExists || !tokenMatches || !deviceMatches || !statusAllows) {
        console.warn(`📡 [LAN] Rejecting reconnect: room=${isRoomValid}, exists=${playerExists}, token=${tokenMatches}, status=${player?.connectionStatus}`);
        
        GameSessionTransport.sendToPeer(sourceIp, {
          type: NETWORK.RECONNECT_FAIL,
          reason: !isRoomValid ? "wrong_room" : !tokenMatches ? "invalid_token" : "not_reconnecting"
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

      // Broadcast success
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
      toast.info("Player reconnected", `${player?.name} joined back.`);
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
      // Guard: don't send pings if transport is closing
      if (GameSessionTransport.isClosing) return;

      if (isHost) {
        GameSessionTransport.sendToClients(packet);
      } else if (context.hostIp) {
        GameSessionTransport.sendToHost(packet);
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
          // Normal disconnect logic for lobby/results
          const leavePacket = {
            type: NETWORK.PLAYER_LEAVE,
            playerId,
            reason: "heartbeat_timeout",
          };
          unregisterRemotePeer(playerId);
          GameSessionTransport.sendToClients(leavePacket);
          handleIncomingPacket(leavePacket, ip);
        } else {
          // Mid-game: Trigger reconnection window
          console.log(`📡 [LAN] Peer ${playerId} lost connection. Starting 20s recovery window.`);
          
          store.dispatch(setPlayerConnectionStatus({ playerId, status: "RECONNECTING" }));
          broadcastPacket({
            type: "RECONNECT_STATUS",
            playerId,
            status: "RECONNECTING"
          });

          // Start timer for bot replacement
          const timer = setTimeout(() => {
            console.log(`📡 [LAN] Recovery window expired for ${playerId}. Replacing with BOT.`);
            ChorPoliceEngine.replacePlayerWithBot(playerId);
            reconnectTimers.delete(playerId);
            clearInterval(reconnectIntervals.get(playerId));
            reconnectIntervals.delete(playerId);
            
            toast.warning("Player lost", "Reconnection failed. Bot joined.");
          }, NETWORK.RECONNECT_TIMEOUT_MS);

          reconnectTimers.set(playerId, timer);
        }
      } else {
        // Client side: Host is stale
        console.log(`📡 [LAN] Host at ${ip} is stale. Starting reconnection overlay.`);
        
        const phase = store.getState().session.gamePhase;
        if (phase === "idle" || phase === "finished" || phase === "final_result") {
          // Normal disconnect for non-game phases
          const leavePacket = {
            type: NETWORK.PLAYER_LEAVE,
            playerId: "host_id",
            reason: "host_disconnected",
          };
          handleIncomingPacket(leavePacket, ip);
        } else {
          // Trigger local reconnect overlay
          store.dispatch(setLocalReconnecting({ 
            isReconnecting: true, 
            timeout: Math.floor(NETWORK.RECONNECT_TIMEOUT_MS / 1000) 
          }));

          const interval = setInterval(() => {
            store.dispatch(tickReconnectTimeout());
          }, 1000);
          reconnectIntervals.set("host", interval);

          const timer = setTimeout(() => {
            clearInterval(reconnectIntervals.get("host"));
            reconnectIntervals.delete("host");
            
            toast.error("Match ended", "Host disconnected. Coins refunded.");
            
            const leavePacket = {
              type: NETWORK.PLAYER_LEAVE,
              playerId: "host_id",
              reason: "host_disconnected",
            };
            handleIncomingPacket(leavePacket, ip);
          }, NETWORK.RECONNECT_TIMEOUT_MS);

          reconnectTimers.set("host", timer);
        }
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
};

const stopHeartbeat = () => {
  HeartbeatService.stop();
};
