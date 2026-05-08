/**
 * TcpClient — Manages outbound TCP connections from client to host.
 * Extracted from GameSessionTransport for Single Responsibility.
 * 
 * 🛡️ ARCHITECTURAL RULES:
 * 1. NEVER destroy a socket from a stale timeout or callback.
 * 2. ALWAYS verify thisAttemptId === cs.attemptId before destroying or modifying state.
 * 3. ALWAYS use safeDestroySocket() instead of direct socket.destroy().
 */
import TcpSocket from "react-native-tcp-socket";
import { Buffer } from "buffer";
import { NETWORK } from "@/constants/Networking";
import { extractFrames } from "./TcpFraming";
import { reportStaleEvent } from "./TcpDiagnostics";

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
 * Safely destroys a socket, guarding against already-destroyed or null references.
 * This is the ONLY place socket.destroy() should be called for client sockets.
 */
const safeDestroySocket = (socket: any, reason: string): void => {
  if (!socket) return;
  try {
    if (!socket.destroyed && !(socket as any).__explicitlyDestroyed) {
      devLog(`Destroying socket: ${reason}`);
      (socket as any).__explicitlyDestroyed = true;
      socket.destroy();
    }
  } catch (e) {
    // Socket may already be cleaned up by react-native-tcp-socket native module
    devLog(`Destroy suppressed (${reason}):`, e);
  }
};

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
      safeDestroySocket(cs.clientSocket, "pre-connect cleanup");
      cs.clientSocket = null;
    }
    cs.hostBuffer = Buffer.alloc(0);
    console.log(`[TCP_DEBUG] CREATE_CONNECTION host=${hostIp}:${port}`);
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

  cs.attemptId++;
  const thisAttemptId = cs.attemptId;

  const attachListeners = () => {
    if (!cs.clientSocket) return; // Guard: socket may have been destroyed between creation and listener attachment

    cs.clientSocket.on("data", (data: any) => {
      // FIX-1: Any data from host proves connection is alive — clear pending timeout
      clearConnectTimeout("data received from host");
      // Guard: stale callback after session change
      if (thisAttemptId !== cs.attemptId) {
        if (__DEV__) console.log(`[TCP] stale callback ignored (data) attempt=${thisAttemptId} current=${cs.attemptId}`);
        reportStaleEvent(false);
        return;
      }

      try {
        const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
        cs.hostBuffer = Buffer.concat([cs.hostBuffer, raw]);
        const [packets, remaining] = extractFrames(cs.hostBuffer);
        cs.hostBuffer = remaining;
        for (const env of packets) {
          if (__DEV__) console.log(`[TCP_DEBUG] PACKET_RECEIVED type=${env.packet?.type} from=${hostIp}`);
          packetHandler?.(env.packet, hostIp);
        }
      } catch (e) {
        console.warn("[TCP_DEBUG] CLIENT_DATA_PARSE_ERROR", e);
      }
    });

    cs.clientSocket.on("error", (error: any) => {
      clearConnectTimeout("socket error");
      if (thisAttemptId !== cs.attemptId) {
        if (__DEV__) console.log(`[TCP] stale callback ignored (error) attempt=${thisAttemptId} current=${cs.attemptId}`);
        reportStaleEvent(false);
        return;
      }
      console.warn(`[TCP_DEBUG] HOST_CONN_ERROR attempt=${thisAttemptId}`, error?.message);
    });

    cs.clientSocket.on("close", () => {
      clearConnectTimeout("socket close");
      if (thisAttemptId !== cs.attemptId) {
        if (__DEV__) console.log(`[TCP] stale callback ignored (close) attempt=${thisAttemptId} current=${cs.attemptId}`);
        reportStaleEvent(false);
        return;
      }
      console.log(`[TCP_DEBUG] HOST_SOCKET_CLOSE attempt=${thisAttemptId}`);
      sockets.delete(hostIp);
      
      // 🔥 Trigger soft reconnect flow immediately on socket close
      packetHandler?.({ type: "LOCAL_SOCKET_CLOSED", hostIp }, hostIp);
      
      // Only null out if this is still the active socket
      if (cs.clientSocket && thisAttemptId === cs.attemptId) {
        cs.clientSocket = null;
      }
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

  if (reusingSocket) {
    // FIX-1b: Reusing socket means we're already connected — no timeout needed
    clearConnectTimeout("reusing existing socket");
    attachListeners();
  } else {
    try {
      cs.clientSocket = TcpSocket.createConnection({ port, host: hostIp }, () => {
        clearConnectTimeout(`connected to ${hostIp}:${port}`);
        // Guard: verify this is still the active attempt before registering
        if (thisAttemptId === cs.attemptId) {
          sockets.set(hostIp, cs.clientSocket);
          console.log(`[TCP_DEBUG] SOCKET_CONNECTED host=${hostIp}:${port}`);
        } else {
          // Stale connection — destroy it
          safeDestroySocket(cs.clientSocket, "stale connect callback");
        }
      });
      attachListeners();
    } catch (e) {
      console.warn(`[TCP_DEBUG] CREATE_CONNECTION_FAILED host=${hostIp}:${port}`, e);
      cs.clientSocket = null;
      return;
    }
  }

  // Connection Timeout Guard (5s) — triple-guarded:
  //  1. attemptId must match (prevents stale timeout from old attempts)
  //  2. socket must NOT be in sockets map (means connect callback hasn't fired)
  //  3. socket must still exist and not be destroyed
  if (!reusingSocket) {
    connectionTimeout = setTimeout(() => {
      if (thisAttemptId !== cs.attemptId) {
        if (__DEV__) console.log(`[TCP] stale timeout ignored attempt=${thisAttemptId} current=${cs.attemptId}`);
        reportStaleEvent(true);
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
        safeDestroySocket(cs.clientSocket, "connection timeout");
        cs.clientSocket = null;
      }
    }, 5000);
  }
};

/**
 * Independent connection probe. Does NOT use or modify the singleton ClientState.
 * Returns the connected socket if successful, allowing the caller to 'promote' it.
 */
export const probeAsync = (
  hostIp: string,
  hostPort: number,
  timeoutMs: number = 1000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const port = hostPort || NETWORK.TCP_SERVER_PORT;
    let finished = false;
    let socket: any = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const finish = (err?: Error) => {
      if (finished) return;
      finished = true;
      if (timeout) { clearTimeout(timeout); timeout = null; }
      if (err) {
        if (socket) {
          try {
            (socket as any).__explicitlyDestroyed = true;
            socket.destroy();
          } catch {}
        }
        reject(err);
      } else {
        resolve(socket);
      }
    };

    try {
      socket = TcpSocket.createConnection({ port, host: hostIp }, () => {
        finish();
      });
      socket.on("error", (err: any) => finish(err));
      socket.on("close", () => finish(new Error("Closed")));
      timeout = setTimeout(() => finish(new Error("Timeout")), timeoutMs);
    } catch (e: any) {
      finish(e);
    }
  });
};
