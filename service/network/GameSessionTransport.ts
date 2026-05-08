/**
 * GameSessionTransport — TCP transport layer orchestrator.
 * 
 * Delegates to:
 *  - TcpServerManager: port binding & server lifecycle
 *  - TcpClient: outbound connections & reconnect
 *  - TcpFraming: length-prefixed packet encoding/decoding
 * 
 * 🛡️ ARCHITECTURAL RULES:
 * 1. NEVER call socket.write() directly. Use GameSessionTransport.safeSend().
 * 2. ALWAYS set __explicitlyDestroyed = true before calling socket.destroy().
 * 3. ALWAYS check isClosing and currentSessionId before sensitive operations.
 */
import { Buffer } from "buffer";
import { NETWORK } from "@/constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";
import { normalizePeerIp } from "./normalizePeerIp";
import { framePacket, extractFrames } from "./TcpFraming";
import { TcpServerManager } from "./TcpServerManager";
import { TCP_STATS, resetTcpStats } from "./TcpDiagnostics";
import { createClientState, connectToHost, probeAsync as clientProbeAsync } from "./TcpClient";

type PacketHandler = (packet: any, sourceIp?: string) => void;
type SessionConfig = { isHost: boolean; localPlayerId: string; hostIp?: string | null; hostPort?: number; onPacket: PacketHandler };
type SessionSnapshot = { isHost: boolean; localPlayerId: string; hostIp: string | null; clientIps: string[]; listeningPort: number };

const PRIMARY_PORT = NETWORK.TCP_SERVER_PORT;
const FALLBACK_PORTS = [41236, 41237, 41238, 41239, 41240];
const ALL_PORTS = [PRIMARY_PORT, ...FALLBACK_PORTS];

let tcpServer: any = null;
let packetHandler: PacketHandler | null = null;
let pendingServerStartPromise: Promise<void> | null = null;
let pendingServerStopPromise: Promise<boolean> | null = null;
let currentSessionId = 0;
/** Guards against duplicate stop/cleanup and write-after-destroy */
let isClosing = false;

const client = createClientState();

const state = {
  isHost: false, localPlayerId: "host_id", hostIp: null as string | null,
  listeningPort: PRIMARY_PORT as number,
  clientSockets: new Map<string, any>(), clientIps: new Set<string>(),
  playerIdByIp: new Map<string, string>(), ipByPlayerId: new Map<string, string>(),
  clientBuffers: new Map<string, Buffer>(),
};

// ── Server Start (port rotation) ──

const startTcpServer = (): Promise<void> => {
  if (pendingServerStartPromise) return pendingServerStartPromise;
  if (tcpServer) return Promise.resolve();

  console.log("[TCP_DEBUG] SERVER_START_ATTEMPT");

  pendingServerStartPromise = (async () => {
    const errors: string[] = [];
    const portsToTry = [...ALL_PORTS, 0]; // 0 = dynamic fallback

    for (let i = 0; i < portsToTry.length; i++) {
      const port = portsToTry[i];
      try {
        const { server, promise } = TcpServerManager.tryListen(port, {
          onConnection: (socket) => {
            if (isClosing) {
              try { 
                (socket as any).__explicitlyDestroyed = true;
                socket.destroy(); 
              } catch {}
              return;
            }
            const ip = socket.remoteAddress?.replace("::ffff:", "") || "unknown";
            if (ip === "unknown") { 
              try { 
                (socket as any).__explicitlyDestroyed = true;
                socket.destroy(); 
              } catch {} 
              return; 
            }

            console.log(`[TCP_DEBUG] CLIENT_CONNECTED ip=${ip}`);
            state.clientSockets.set(ip, socket);
            state.clientIps.add(ip);
            state.clientBuffers.set(ip, Buffer.alloc(0));

            socket.on("data", (data: any) => {
              if (isClosing) return;
              try {
                const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
                const existing = state.clientBuffers.get(ip) || Buffer.alloc(0);
                const [packets, remaining] = extractFrames(Buffer.concat([existing, raw]));
                state.clientBuffers.set(ip, remaining);
                packets.forEach(env => packetHandler?.(env.packet, ip));
              } catch (e) {
                console.warn("[TCP_DEBUG] DATA_PARSE_ERROR", e);
              }
            });
            socket.on("close", () => {
              console.log(`[TCP_DEBUG] CLIENT_SOCKET_CLOSE ip=${ip}`);
              state.clientSockets.delete(ip);
              state.clientBuffers.delete(ip);
              state.clientIps.delete(ip);
            });
            socket.on("error", (err: any) => {
              console.warn(`[TCP_DEBUG] CLIENT_SOCKET_ERROR ip=${ip}`, err?.message);
            });
          },
          onListening: (actualPort) => {
            tcpServer = server;
            state.listeningPort = actualPort;
            console.log(`[TCP_DEBUG] SERVER_LISTENING port=${actualPort}`);
          },
          onError: () => {},
        }, 3000);
        await promise;
        pendingServerStartPromise = null;
        return;
      } catch (e: any) {
        errors.push(`Port ${port}: ${e?.message || "unknown"}`);
        if (i < portsToTry.length - 1) await new Promise(r => setTimeout(r, 200));
      }
    }
    pendingServerStartPromise = null;
    throw new Error(`All port attempts failed. Restart Wi-Fi/Hotspot: ${errors.join("; ")}`);
  })();
  return pendingServerStartPromise;
};

// ── Safe Send ──

/**
 * Production-safe socket write with full lifecycle guards.
 * Returns false if write was skipped or failed.
 */
const safeSend = (socket: any, framedData: Buffer, label: string, sid: number): boolean => {
  TCP_STATS.totalSafeSendAttempts++;

  // Guard: session mismatch (stale callback)
  if (sid !== currentSessionId) {
    if (__DEV__) console.log(`[TCP] safeSend dropped: stale session label=${label} sid=${sid} current=${currentSessionId}`);
    return false;
  }
  // Guard: closing in progress
  if (isClosing) {
    if (__DEV__) console.log(`[TCP] safeSend dropped: is_closing label=${label}`);
    return false;
  }
  // Guard: null or destroyed socket
  if (!socket || socket.destroyed || (socket as any).__explicitlyDestroyed) {
    TCP_STATS.totalSafeSendDroppedDestroyed++;
    if (__DEV__) console.log(`[TCP] safeSend dropped: socket invalid (null=${!socket}, destroyed=${socket?.destroyed}, explicit=${(socket as any).__explicitlyDestroyed}) label=${label}`);
    return false;
  }

  // Guard: writable state
  if (typeof socket.write !== "function" || socket.readyState !== "open") {
    TCP_STATS.totalSafeSendDroppedNotOpen++;
    if (__DEV__) console.log(`[TCP] safeSend dropped: socket not open (state=${socket?.readyState}) label=${label}`);
    return false;
  }

  try {
    socket.write(framedData);
    TCP_STATS.totalSafeSendSuccess++;
    return true;
  } catch (e) {
    console.warn(`[TCP] safeSend write failed label=${label}`, e);
    return false;
  }
};

// ── Public API ──

export const GameSessionTransport = {
  start: async ({ isHost, localPlayerId, hostIp = null, hostPort, onPacket }: SessionConfig) => {
    console.log(`[TCP_DEBUG] SESSION_START isHost=${isHost} hostIp=${hostIp}`);
    await GameSessionTransport.stop();
    resetTcpStats();
    isClosing = false; // Reset after stop completes
    currentSessionId++;
    const thisSession = currentSessionId;
    state.isHost = isHost; state.localPlayerId = localPlayerId; state.hostIp = hostIp;
    if (hostPort) state.listeningPort = hostPort;
    updateDebugMetric("hostIp", hostIp ?? (isHost ? "self-hosted" : "N/A"));
    packetHandler = onPacket;

    if (isHost) {
      await startTcpServer();
      if (thisSession !== currentSessionId) throw new Error("Session cancelled during startup");
    }
  },

  probeAsync: (hostIp: string, hostPort: number, timeoutMs?: number): Promise<any> =>
    clientProbeAsync(hostIp, hostPort, timeoutMs),

  /**
   * Promotes an independently probed socket to be the official session socket.
   */
  useSocket: (hostIp: string, socket: any) => {
    if (isClosing) {
      try { (socket as any).__explicitlyDestroyed = true; socket.destroy(); } catch {}
      return;
    }
    console.log(`[TCP_DEBUG] PROMOTING_SOCKET host=${hostIp}`);
    state.hostIp = hostIp;
    client.clientSocket = socket;
    state.clientSockets.set(hostIp, socket);
    // Trigger the standard listener attachment via setHostIp or manually
    // In this case, we've already done the handshake, so we just need to 
    // ensure standard listeners are attached for subsequent packets.
    GameSessionTransport.setHostIp(hostIp, state.listeningPort);
  },

  stop: async (): Promise<boolean> => {
    // Idempotent: if already closing, return existing promise
    if (pendingServerStopPromise) return pendingServerStopPromise;
    // Guard: if already closed and nothing to clean, fast-return
    if (isClosing) return Promise.resolve(true);

    console.log("[TCP_DEBUG] SESSION_STOP_START");
    isClosing = true;
    currentSessionId++; client.attemptId++;
    pendingServerStartPromise = null;

    pendingServerStopPromise = new Promise(resolve => {
      let resolved = false;
      const safeResolve = (val: boolean) => {
        if (resolved) return;
        resolved = true;
        tcpServer = null;
        pendingServerStopPromise = null;
        console.log(`[TCP_DEBUG] SESSION_STOP_DONE success=${val}`);
        resolve(val);
      };

      const cleanup = () => {
        state.hostIp = null;
        // Capture sockets first, then clear map immediately to prevent new safeSend lookups
        const socketsToDestroy = Array.from(state.clientSockets.values());
        state.clientSockets.clear();

        socketsToDestroy.forEach(s => { 
          try { 
            if (s && !s.destroyed) {
              (s as any).__explicitlyDestroyed = true;
              s.destroy(); 
            }
          } catch {} 
        });
        if (client.clientSocket) { 
          try { 
            if (!client.clientSocket.destroyed) {
              (client.clientSocket as any).__explicitlyDestroyed = true;
              client.clientSocket.destroy(); 
            }
          } catch {} 
          client.clientSocket = null; 
        }
        packetHandler = null; state.isHost = false; state.localPlayerId = "host_id";
        state.listeningPort = PRIMARY_PORT;
        state.clientSockets.clear(); state.clientIps.clear();
        state.playerIdByIp.clear(); state.ipByPlayerId.clear();
        state.clientBuffers.clear(); client.hostBuffer = Buffer.alloc(0);
        pendingServerStartPromise = null;
        updateDebugMetric("hostIp", "N/A");
      };

      if (tcpServer) {
        try {
          // Capture and clear immediately
          const socketsToDestroy = Array.from(state.clientSockets.values());
          state.clientSockets.clear();

          socketsToDestroy.forEach(s => { 
            try { 
              if (s && !s.destroyed && !(s as any).__explicitlyDestroyed) {
                TCP_STATS.totalSocketCleanupCompleted++;
                (s as any).__explicitlyDestroyed = true;
                s.destroy(); 
              }
            } catch {} 
          });
          tcpServer.removeAllListeners();
          tcpServer.close(() => { cleanup(); safeResolve(true); });
          // Safety timeout: if server.close() callback never fires
          setTimeout(() => { cleanup(); safeResolve(false); }, 800);
        } catch { cleanup(); safeResolve(false); }
      } else {
        cleanup(); safeResolve(true);
      }
    });
    return pendingServerStopPromise;
  },

  setHostIp: (hostIp: string | null, hostPort?: number) => {
    if (isClosing) return;
    state.hostIp = hostIp;
    if (hostPort) state.listeningPort = hostPort;
    updateDebugMetric("hostIp", hostIp ?? "N/A");
    if (hostIp && !state.isHost) connectToHost(client, hostIp, hostPort || state.listeningPort, state.clientSockets, () => state.hostIp, packetHandler);
  },

  registerPeer: (playerId: string, rawIp: string) => {
    if (!playerId || !rawIp || isClosing) return;
    const ip = normalizePeerIp(rawIp) || rawIp;
    state.clientIps.add(ip); state.playerIdByIp.set(ip, playerId); state.ipByPlayerId.set(playerId, ip);
  },

  unregisterPeer: (playerId: string) => {
    const ip = state.ipByPlayerId.get(playerId); if (!ip) return;
    state.ipByPlayerId.delete(playerId); state.playerIdByIp.delete(ip); state.clientIps.delete(ip);
    const socket = state.clientSockets.get(ip);
    if (socket) {
      try { 
        if (!socket.destroyed && !(socket as any).__explicitlyDestroyed) {
          if (__DEV__) console.log(`[TCP] socket cleanup complete for peer: ${ip}`);
          TCP_STATS.totalSocketCleanupCompleted++;
          (socket as any).__explicitlyDestroyed = true;
          socket.destroy(); 
        }
      } catch {}
      state.clientSockets.delete(ip); state.clientBuffers.delete(ip);
    }
  },

  getPlayerIdByIp: (ip: string) => state.playerIdByIp.get(ip),
  getIpByPlayerId: (playerId: string) => state.ipByPlayerId.get(playerId),
  getListeningPort: (): number => state.listeningPort,

  sendToHost: (packet: any) => {
    if (!state.hostIp || isClosing) return;
    const framed = framePacket(packet); const sid = currentSessionId;
    if (client.clientSocket && !client.clientSocket.destroyed) {
      safeSend(client.clientSocket, framed, `host`, sid);
    } else {
      connectToHost(client, state.hostIp, state.listeningPort, state.clientSockets, () => state.hostIp, packetHandler);
      const hip = state.hostIp;
      [300, 800].forEach(d => setTimeout(() => {
        // Triple-guard retry: session must match, hostIp must match, not closing
        if (isClosing || currentSessionId !== sid || state.hostIp !== hip) return;
        if (client.clientSocket && !client.clientSocket.destroyed)
          safeSend(client.clientSocket, framed, `host-retry`, sid);
      }, d));
    }
  },

  sendToPeer: (ip: string, packet: any) => {
    if (isClosing) return;
    const socket = state.clientSockets.get(ip);
    if (socket) safeSend(socket, framePacket(packet), `peer(${ip})`, currentSessionId);
  },

  sendToClients: (packet: any) => {
    if (isClosing) return;
    const framed = framePacket(packet); const sid = currentSessionId;
    state.clientSockets.forEach((socket, ip) => safeSend(socket, framed, `client(${ip})`, sid));
  },

  getSnapshot: (): SessionSnapshot => ({
    isHost: state.isHost, localPlayerId: state.localPlayerId,
    hostIp: state.hostIp, clientIps: Array.from(state.clientIps), listeningPort: state.listeningPort,
  }),

  isConnectedTo: (ip: string): boolean => {
    if (isClosing) return false;
    if (state.isHost) { const s = state.clientSockets.get(ip); return s != null && !s.destroyed; }
    return client.clientSocket != null && !client.clientSocket.destroyed;
  },

  reconnectToHost: (): boolean => {
    if (isClosing || state.isHost || !state.hostIp) return false;
    try { connectToHost(client, state.hostIp, state.listeningPort, state.clientSockets, () => state.hostIp, packetHandler); return true; }
    catch { return false; }
  },

  /** Expose closing state for external guards (e.g. heartbeat) */
  get isClosing(): boolean { return isClosing; },
  getCurrentSessionId: (): number => currentSessionId,

  /** ── Diagnostic API (Debug Only) ── */
  getDebugSnapshot: () => ({
    isClosing,
    isRunning: !isClosing && (tcpServer != null || client.clientSocket != null),
    activePeerCount: state.clientIps.size,
    activeConnectionToken: client.attemptId,
    activeClientSocketReadyState: client.clientSocket?.readyState ?? "null",
    safeSendStats: { ...TCP_STATS },
    clientSockets: Array.from(state.clientSockets.keys()),
  }),
};
