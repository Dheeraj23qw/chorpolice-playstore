/**
 * GameSessionTransport — TCP transport layer orchestrator.
 * 
 * Delegates to:
 *  - TcpServerManager: port binding & server lifecycle
 *  - TcpClient: outbound connections & reconnect
 *  - TcpFraming: length-prefixed packet encoding/decoding
 */
import { Buffer } from "buffer";
import { NETWORK } from "@/constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";
import { normalizePeerIp } from "./normalizePeerIp";
import { framePacket, extractFrames } from "./TcpFraming";
import { TcpServerManager } from "./TcpServerManager";
import { createClientState, connectToHost, connectAsync as clientConnectAsync } from "./TcpClient";

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

  pendingServerStartPromise = (async () => {
    const errors: string[] = [];
    const portsToTry = [...ALL_PORTS, 0]; // 0 = dynamic fallback

    for (let i = 0; i < portsToTry.length; i++) {
      const port = portsToTry[i];
      try {
        const { server, promise } = TcpServerManager.tryListen(port, {
          onConnection: (socket) => {
            const ip = socket.remoteAddress?.replace("::ffff:", "") || "unknown";
            if (ip === "unknown") { socket.destroy(); return; }
            state.clientSockets.set(ip, socket);
            state.clientIps.add(ip);
            state.clientBuffers.set(ip, Buffer.alloc(0));

            socket.on("data", (data: any) => {
              const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
              const existing = state.clientBuffers.get(ip) || Buffer.alloc(0);
              const [packets, remaining] = extractFrames(Buffer.concat([existing, raw]));
              state.clientBuffers.set(ip, remaining);
              packets.forEach(env => packetHandler?.(env.packet, ip));
            });
            socket.on("close", () => {
              state.clientSockets.delete(ip);
              state.clientBuffers.delete(ip);
              state.clientIps.delete(ip);
            });
          },
          onListening: (actualPort) => { tcpServer = server; state.listeningPort = actualPort; },
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

const safeSend = (socket: any, framedData: Buffer, label: string, sid: number) => {
  if (sid !== currentSessionId || !socket || socket.destroyed) return false;
  try { socket.write(framedData); return true; }
  catch { return false; }
};

// ── Public API ──

export const GameSessionTransport = {
  start: async ({ isHost, localPlayerId, hostIp = null, hostPort, onPacket }: SessionConfig) => {
    await GameSessionTransport.stop();
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

  connectAsync: (hostIp: string, hostPort: number): Promise<void> =>
    clientConnectAsync(client, hostIp, hostPort, state.clientSockets, packetHandler),

  stop: async (): Promise<boolean> => {
    if (pendingServerStopPromise) return pendingServerStopPromise;
    currentSessionId++; client.attemptId++;
    pendingServerStartPromise = null;

    pendingServerStopPromise = new Promise(resolve => {
      const cleanup = () => {
        state.hostIp = null;
        state.clientSockets.forEach(s => { try { s.destroy(); } catch {} });
        if (client.clientSocket) { try { client.clientSocket.destroy(); } catch {} client.clientSocket = null; }
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
          state.clientSockets.forEach(s => { try { s.destroy(); } catch {} });
          state.clientSockets.clear();
          tcpServer.removeAllListeners();
          tcpServer.close(() => { tcpServer = null; cleanup(); pendingServerStopPromise = null; resolve(true); });
          setTimeout(() => { tcpServer = null; cleanup(); pendingServerStopPromise = null; resolve(false); }, 800);
        } catch { tcpServer = null; cleanup(); pendingServerStopPromise = null; resolve(false); }
      } else {
        cleanup(); pendingServerStopPromise = null; resolve(true);
      }
    });
    return pendingServerStopPromise;
  },

  setHostIp: (hostIp: string | null, hostPort?: number) => {
    state.hostIp = hostIp;
    if (hostPort) state.listeningPort = hostPort;
    updateDebugMetric("hostIp", hostIp ?? "N/A");
    if (hostIp && !state.isHost) connectToHost(client, hostIp, hostPort || state.listeningPort, state.clientSockets, () => state.hostIp, packetHandler);
  },

  registerPeer: (playerId: string, rawIp: string) => {
    if (!playerId || !rawIp) return;
    const ip = normalizePeerIp(rawIp) || rawIp;
    state.clientIps.add(ip); state.playerIdByIp.set(ip, playerId); state.ipByPlayerId.set(playerId, ip);
  },

  unregisterPeer: (playerId: string) => {
    const ip = state.ipByPlayerId.get(playerId); if (!ip) return;
    state.ipByPlayerId.delete(playerId); state.playerIdByIp.delete(ip); state.clientIps.delete(ip);
    const socket = state.clientSockets.get(ip);
    if (socket) { try { socket.destroy(); } catch {} state.clientSockets.delete(ip); state.clientBuffers.delete(ip); }
  },

  getPlayerIdByIp: (ip: string) => state.playerIdByIp.get(ip),
  getIpByPlayerId: (playerId: string) => state.ipByPlayerId.get(playerId),
  getListeningPort: (): number => state.listeningPort,

  sendToHost: (packet: any) => {
    if (!state.hostIp) return;
    const framed = framePacket(packet); const sid = currentSessionId;
    if (client.clientSocket && !client.clientSocket.destroyed) {
      safeSend(client.clientSocket, framed, `host`, sid);
    } else {
      connectToHost(client, state.hostIp, state.listeningPort, state.clientSockets, () => state.hostIp, packetHandler);
      const hip = state.hostIp;
      [300, 800].forEach(d => setTimeout(() => {
        if (client.clientSocket && !client.clientSocket.destroyed && state.hostIp === hip && currentSessionId === sid)
          safeSend(client.clientSocket, framed, `host`, sid);
      }, d));
    }
  },

  sendToPeer: (ip: string, packet: any) => {
    const socket = state.clientSockets.get(ip);
    if (socket) safeSend(socket, framePacket(packet), `peer(${ip})`, currentSessionId);
  },

  sendToClients: (packet: any) => {
    const framed = framePacket(packet); const sid = currentSessionId;
    state.clientSockets.forEach((socket, ip) => safeSend(socket, framed, `client(${ip})`, sid));
  },

  getSnapshot: (): SessionSnapshot => ({
    isHost: state.isHost, localPlayerId: state.localPlayerId,
    hostIp: state.hostIp, clientIps: Array.from(state.clientIps), listeningPort: state.listeningPort,
  }),

  isConnectedTo: (ip: string): boolean => {
    if (state.isHost) { const s = state.clientSockets.get(ip); return s != null && !s.destroyed; }
    return client.clientSocket != null && !client.clientSocket.destroyed;
  },

  reconnectToHost: (): boolean => {
    if (state.isHost || !state.hostIp) return false;
    try { connectToHost(client, state.hostIp, state.listeningPort, state.clientSockets, () => state.hostIp, packetHandler); return true; }
    catch { return false; }
  },
};
