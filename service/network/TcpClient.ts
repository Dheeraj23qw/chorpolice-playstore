/**
 * TcpClient — Manages outbound TCP connections from client to host.
 * Extracted from GameSessionTransport for Single Responsibility.
 */
import TcpSocket from "react-native-tcp-socket";
import { Buffer } from "buffer";
import { NETWORK } from "@/constants/Networking";
import { extractFrames } from "./TcpFraming";

type PacketHandler = (packet: any, sourceIp?: string) => void;

const devLog = (msg: string, ...a: any[]) => { if (__DEV__) console.log(`[TcpClient] ${msg}`, ...a); };
const devWarn = (msg: string, ...a: any[]) => { if (__DEV__) console.warn(`[TcpClient] ${msg}`, ...a); };

export type ClientState = {
  clientSocket: any;
  hostBuffer: Buffer;
  attemptId: number;
};

export const createClientState = (): ClientState => ({
  clientSocket: null,
  hostBuffer: Buffer.alloc(0),
  attemptId: 0,
});

/**
 * Connects to a host with full lifecycle management:
 * - Socket reuse from connectAsync probe
 * - Connection timeout guard with attempt ID tracking
 * - Auto-reconnect on close (guarded by attempt ID + hostIp)
 */
export const connectToHost = (
  cs: ClientState,
  hostIp: string,
  hostPort: number,
  sockets: Map<string, any>,
  getHostIp: () => string | null,
  packetHandler: PacketHandler | null,
) => {
  const port = hostPort || NETWORK.TCP_SERVER_PORT;
  let reusingSocket = false;

  if (cs.clientSocket && !cs.clientSocket.destroyed && sockets.get(hostIp) === cs.clientSocket) {
    devLog(`Reusing existing connection to ${hostIp}:${port}`);
    reusingSocket = true;
    cs.clientSocket.removeAllListeners();
  } else {
    if (cs.clientSocket) {
      try { cs.clientSocket.destroy(); } catch { /* ignore */ }
      cs.clientSocket = null;
    }
    cs.hostBuffer = Buffer.alloc(0);
    devLog(`Connecting to ${hostIp}:${port}...`);
  }

  let connectionTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Safely cancel the connection timeout */
  const clearConnectTimeout = (reason: string) => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
      devLog(`Connect timeout cleared: ${reason}`);
    }
  };

  const attachListeners = () => {
    cs.clientSocket.on("data", (data: any) => {
      // FIX-1: Any data from host proves connection is alive — clear pending timeout
      clearConnectTimeout("data received from host");

      const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
      cs.hostBuffer = Buffer.concat([cs.hostBuffer, raw]);
      const [packets, remaining] = extractFrames(cs.hostBuffer);
      cs.hostBuffer = remaining;
      for (const env of packets) {
        packetHandler?.(env.packet, hostIp);
      }
    });

    cs.clientSocket.on("error", (error: any) => {
      clearConnectTimeout("socket error");
      console.error(`[TcpClient] Host connection error:`, error?.message);
    });

    const thisAttemptId = cs.attemptId;
    cs.clientSocket.on("close", () => {
      clearConnectTimeout("socket close");
      sockets.delete(hostIp);
      cs.clientSocket = null;
      // Only reconnect if session is still active AND this was the active attempt
      if (getHostIp() === hostIp && thisAttemptId === cs.attemptId) {
        devLog("Auto-reconnecting in 1500ms...");
        setTimeout(() => {
          if (getHostIp() === hostIp && thisAttemptId === cs.attemptId) {
            connectToHost(cs, hostIp, port, sockets, getHostIp, packetHandler);
          }
        }, 1500);
      }
    });
  };

  cs.attemptId++;
  const thisAttemptId = cs.attemptId;

  if (reusingSocket) {
    // FIX-1b: Reusing socket means we're already connected — no timeout needed
    clearConnectTimeout("reusing existing socket");
    attachListeners();
  } else {
    cs.clientSocket = TcpSocket.createConnection({ port, host: hostIp }, () => {
      clearConnectTimeout(`connected to ${hostIp}:${port}`);
      sockets.set(hostIp, cs.clientSocket);
      devLog(`Connected to host: ${hostIp}:${port}`);
    });
    attachListeners();
  }

  // Connection Timeout Guard (5s) — triple-guarded:
  //  1. attemptId must match (prevents stale timeout from old attempts)
  //  2. socket must NOT be in sockets map (means connect callback hasn't fired)
  //  3. socket must still exist and not be destroyed
  if (!reusingSocket) {
    connectionTimeout = setTimeout(() => {
      if (thisAttemptId !== cs.attemptId) {
        devLog(`Stale timeout ignored for attempt ${thisAttemptId} (current: ${cs.attemptId})`);
        return;
      }
      // FIX-1c: If socket is already registered (connected), do NOT destroy it
      if (sockets.has(hostIp)) {
        devLog(`Timeout ignored: socket already connected to ${hostIp}`);
        connectionTimeout = null;
        return;
      }
      connectionTimeout = null;
      if (cs.clientSocket && !cs.clientSocket.destroyed) {
        devWarn(`Connection timed out: ${hostIp}:${port} (attempt ${thisAttemptId})`);
        cs.clientSocket.destroy();
        cs.clientSocket = null;
      }
    }, 5000);
  }
};

/**
 * One-shot async connection probe. Used by Smart Join to test candidate IPs.
 */
export const connectAsync = (
  cs: ClientState,
  hostIp: string,
  hostPort: number,
  sockets: Map<string, any>,
  packetHandler: PacketHandler | null,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const port = hostPort || NETWORK.TCP_SERVER_PORT;
    if (cs.clientSocket) {
      try { cs.clientSocket.destroy(); } catch { /* ignore */ }
      cs.clientSocket = null;
    }
    cs.hostBuffer = Buffer.alloc(0);
    cs.attemptId++;
    const thisAttemptId = cs.attemptId;
    devLog(`Async connecting to ${hostIp}:${port}... (attempt ${thisAttemptId})`);

    let finished = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const finish = (err?: Error) => {
      if (finished) return;
      finished = true;
      if (timeout) clearTimeout(timeout);
      if (err) {
        if (cs.clientSocket) cs.clientSocket.destroy();
        cs.clientSocket = null;
        reject(err);
      } else {
        resolve();
      }
    };

    try {
      cs.clientSocket = TcpSocket.createConnection({ port, host: hostIp }, () => {
        devLog(`Async connection success: ${hostIp}:${port}`);
        sockets.set(hostIp, cs.clientSocket);
        finish();
      });

      timeout = setTimeout(() => {
        if (finished) return;
        finish(new Error(`Connection to ${hostIp}:${port} timed out`));
      }, 1200);

      cs.clientSocket.on("error", (err: any) => finish(err));
      cs.clientSocket.on("close", () => finish(new Error("Socket closed before connection")));

      cs.clientSocket.on("data", (data: any) => {
        const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
        cs.hostBuffer = Buffer.concat([cs.hostBuffer, raw]);
        const [packets, remaining] = extractFrames(cs.hostBuffer);
        cs.hostBuffer = remaining;
        for (const env of packets) {
          packetHandler?.(env.packet, hostIp);
        }
      });
    } catch (e: any) {
      finish(e);
    }
  });
};
