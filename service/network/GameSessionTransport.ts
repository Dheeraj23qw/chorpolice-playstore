/**
 * GameSessionTransport — TCP-based reliable transport layer.
 *
 * WHY TCP?
 * - UDP packets can be lost, reordered, or duplicated. For game-critical data
 *   like role assignments, card deals, and scores, we need guaranteed delivery.
 * - TCP provides stream-based reliable ordering out of the box.
 *
 * FRAMING PROTOCOL:
 * Each message is prefixed with a 4-byte big-endian length header:
 *   [4 bytes: payload length][N bytes: JSON payload]
 * This prevents TCP stream fragmentation issues where multiple JSON objects
 * arrive concatenated in a single `onData` callback.
 *
 * PORT STRATEGY:
 * The server attempts the configured primary port first. If it fails (port in
 * use, OS hasn't released it from a previous session, etc.), it rotates
 * through a pool of fallback ports. The actual listening port is exposed via
 * getListeningPort() so QR codes and client connections use the right port.
 */
import { Buffer } from "buffer";
import TcpSocket from "react-native-tcp-socket";
import { NETWORK } from "@/constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";

type PacketHandler = (packet: any, sourceIp?: string) => void;

type SessionConfig = {
  isHost: boolean;
  localPlayerId: string;
  hostIp?: string | null;
  hostPort?: number;
  onPacket: PacketHandler;
};

type SessionSnapshot = {
  isHost: boolean;
  localPlayerId: string;
  hostIp: string | null;
  clientIps: string[];
  listeningPort: number;
};

type PacketEnvelope = {
  version: string;
  packet: any;
};

// ── Port Configuration ──
// Primary port + fallback pool. If the primary port is occupied (common on
// Android when a previous session's socket is still in TIME_WAIT), we rotate
// through fallbacks until one succeeds.
const PRIMARY_PORT = NETWORK.TCP_SERVER_PORT;
const FALLBACK_PORTS = [41236, 41237, 41238, 41239, 41240];
const ALL_PORTS = [PRIMARY_PORT, ...FALLBACK_PORTS];
const SERVER_START_TIMEOUT_MS = 3000;

let tcpServer: any = null;
let clientSocket: any = null;
let packetHandler: PacketHandler | null = null;
let pendingServerStartPromise: Promise<void> | null = null;
let pendingServerStopPromise: Promise<boolean> | null = null;
let serverRetryTimer: ReturnType<typeof setTimeout> | null = null;
let currentSessionId = 0;

const state = {
  isHost: false,
  localPlayerId: "host_id",
  hostIp: null as string | null,
  listeningPort: PRIMARY_PORT as number,
  clientSockets: new Map<string, any>(), // ip -> socket
  clientIps: new Set<string>(),
  playerIdByIp: new Map<string, string>(),
  ipByPlayerId: new Map<string, string>(),
  clientBuffers: new Map<string, Buffer>(), // ip -> partial data buffer
  hostBuffer: Buffer.alloc(0), // partial data buffer for client side
};

const devLog = (tag: string, message: string, ...args: any[]) => {
  if (__DEV__) {
    console.log(`[TCP Transport][${tag}] ${message}`, ...args);
  }
};

const devWarn = (tag: string, message: string, ...args: any[]) => {
  if (__DEV__) {
    console.warn(`[TCP Transport][${tag}] ${message}`, ...args);
  }
};

// ── Framing Helpers ──

/**
 * Wraps a packet in a length-prefixed envelope for reliable TCP transfer.
 */
const framePacket = (packet: any): Buffer => {
  const payload = JSON.stringify({
    version: NETWORK.PROTOCOL_VERSION,
    packet,
  });
  const payloadBuffer = Buffer.from(payload, "utf-8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payloadBuffer.length, 0);
  return Buffer.concat([header, payloadBuffer]);
};

/**
 * Extracts complete framed packets from a buffer.
 * Returns [extractedPackets, remainingBuffer].
 */
const extractFrames = (buffer: Buffer): [PacketEnvelope[], Buffer] => {
  const packets: PacketEnvelope[] = [];
  let offset = 0;

  while (offset + 4 <= buffer.length) {
    const payloadLength = buffer.readUInt32BE(offset);

    // Sanity check: reject absurdly large frames (> 1MB)
    if (payloadLength > 1_048_576) {
      devWarn(
        "Frame",
        `Rejecting oversized frame (${payloadLength} bytes). Resetting buffer.`,
      );
      return [packets, Buffer.alloc(0)];
    }

    if (offset + 4 + payloadLength > buffer.length) {
      // Incomplete frame; wait for more data
      break;
    }

    try {
      const payloadStr = buffer.toString(
        "utf-8",
        offset + 4,
        offset + 4 + payloadLength,
      );
      const envelope = JSON.parse(payloadStr) as PacketEnvelope;

      if (
        envelope &&
        envelope.version === NETWORK.PROTOCOL_VERSION &&
        envelope.packet
      ) {
        packets.push(envelope);
      } else {
        devWarn(
          "Frame",
          `Dropping packet with mismatched version: ${envelope?.version}`,
        );
      }
    } catch (error) {
      devWarn("Frame", "Frame parse error:", error);
    }

    offset += 4 + payloadLength;
  }

  const remaining = buffer.slice(offset);
  return [packets, remaining];
};

// ── TCP Server (Host) ──

/**
 * Attempts to start a TCP server on the given port.
 * Returns a Promise that resolves if the server starts listening,
 * or rejects with the error.
 */
const tryListenOnPort = (port: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    devLog("Server", `Trying to bind on port ${port}...`);

    const server = TcpSocket.createServer((socket: any) => {
      // Resolve Remote IP immediately
      const remoteIp: string =
        socket.remoteAddress?.replace("::ffff:", "") || "unknown";

      // CRITICAL: Reject connections that can't be identified
      if (remoteIp === "unknown") {
        devWarn("Server", "Rejecting connection with unknown IP");
        socket.destroy();
        return;
      }

      const remotePort: number = socket.remotePort || 0;
      devLog("Server", `Client connected: ${remoteIp}:${remotePort}`);

      state.clientSockets.set(remoteIp, socket);
      state.clientIps.add(remoteIp);
      state.clientBuffers.set(remoteIp, Buffer.alloc(0));

      socket.on("data", (data: any) => {
        const rawBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const existingBuffer =
          state.clientBuffers.get(remoteIp) || Buffer.alloc(0);
        const combined = Buffer.concat([existingBuffer, rawBuffer]);
        const [packets, remaining] = extractFrames(combined);
        state.clientBuffers.set(remoteIp, remaining);

        for (const envelope of packets) {
          packetHandler?.(envelope.packet, remoteIp);
        }
      });

      socket.on("error", (error: any) => {
        devWarn("Socket", `Socket error (${remoteIp}):`, error?.message);
      });

      socket.on("close", () => {
        // NET-1 FIX: clean up ALL maps and notify the game layer.
        const playerId = state.playerIdByIp.get(remoteIp);
        state.clientSockets.delete(remoteIp);
        state.clientBuffers.delete(remoteIp);
        state.clientIps.delete(remoteIp);
        if (playerId) {
          state.playerIdByIp.delete(remoteIp);
          state.ipByPlayerId.delete(playerId);
          // Synthesise a PLAYER_LEAVE so game engines and lobby coordinator react
          if (packetHandler) {
            packetHandler(
              { type: "PLAYER_LEAVE", playerId, reason: "tcp_close" },
              remoteIp,
            );
          }
        }
      });
    });

    let settled = false;

    // Timeout fallback — if neither `listening` nor `error` fires within
    // SERVER_START_TIMEOUT_MS, we assume the native layer is stuck and
    // clean up.
    const startupTimeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      devWarn(
        "Server",
        `Bind on port ${port} timed out after ${SERVER_START_TIMEOUT_MS}ms`,
      );
      try {
        server.removeAllListeners();
      } catch {
        /* ignore */
      }
      try {
        server.close();
      } catch {
        /* ignore */
      }
      reject(new Error(`Timeout binding port ${port}`));
    }, SERVER_START_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(startupTimeout);
    };

    server.on("close", () => {
      cleanup();
      if (tcpServer === server) {
        tcpServer = null;
      }
    });

    server.on("error", (error: any) => {
      cleanup();
      if (settled) return;
      settled = true;
      const msg = error?.message || error?.code || (typeof error === 'string' ? error : JSON.stringify(error)) || "Unknown server error";
      devWarn("Server", `Bind on port ${port} failed: ${msg}`);
      try {
        server.removeAllListeners();
      } catch {
        /* ignore */
      }
      try {
        server.close();
      } catch {
        /* ignore */
      }
      reject(new Error(msg));
    });

    // Wire up event handlers before listen
    // Removing 'host' and 'reuseAddress' as they can cause "Unknown server error" on Android.
    server.listen({ port }, () => {
      cleanup();
      if (settled) return;
      settled = true;

      const actualPort = server.address()?.port || port;

      // ✅ SUCCESS — assign the server ref and update state
      tcpServer = server;
      state.listeningPort = actualPort;

      devLog("Server", `✅ Listening on port ${actualPort}`);
      updateDebugMetric("hostIp", `self:${actualPort}`);
      resolve();
    });
  });
};

/**
 * Starts the TCP server by trying each port in the pool sequentially.
 * Resolves when one port successfully binds, or rejects if all fail.
 */
const startTcpServer = (): Promise<void> => {
  if (pendingServerStartPromise) {
    return pendingServerStartPromise;
  }

  if (tcpServer) {
    return Promise.resolve();
  }

  pendingServerStartPromise = (async () => {
    const errors: string[] = [];

    // 1. Try our preferred range first
    for (let i = 0; i < ALL_PORTS.length; i++) {
      const port = ALL_PORTS[i];
      devLog(
        "Server",
        `═══ Attempt ${i + 1}/${ALL_PORTS.length} — port ${port} ═══`,
      );

      try {
        await tryListenOnPort(port);
        pendingServerStartPromise = null;
        return;
      } catch (error: any) {
        errors.push(`Port ${port}: ${error?.message || "unknown"}`);
        devWarn(
          "Server",
          `Port ${port} failed (${error?.message}). ${i < ALL_PORTS.length - 1 ? "Trying next port..." : "No more reserved ports."}`,
        );

        if (i < ALL_PORTS.length - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }

    // 2. 🚨 GRACEFUL FALLBACK: Try a random available port if the pool is exhausted
    devWarn("Server", "Reserved port pool exhausted. Attempting dynamic port allocation (Port 0)...");
    try {
      await tryListenOnPort(0);
      pendingServerStartPromise = null;
      return;
    } catch (error: any) {
      errors.push(`Dynamic Port: ${error?.message || "unknown"}`);
      devWarn("Server", "Dynamic port allocation failed.", error);
    }

    pendingServerStartPromise = null;
    const summary = errors.join("; ");
    throw new Error(`All ${ALL_PORTS.length + 1} port attempts failed (including dynamic fallback). Please restart your Wi-Fi or Hotspot: ${summary}`);
  })();

  return pendingServerStartPromise;
};

// ── TCP Client ──

const connectToHost = (hostIp: string, hostPort?: number) => {
  const port = hostPort || state.listeningPort || PRIMARY_PORT;

  // 1. Clean up any existing connection attempts
  if (clientSocket) {
    try {
      clientSocket.destroy();
    } catch {
      /* ignore */
    }
    clientSocket = null;
  }

  // 2. Clear state for the new connection
  state.hostBuffer = Buffer.alloc(0);
  devLog("Client", `Connecting to host ${hostIp}:${port}...`);

  let connectionTimeout: ReturnType<typeof setTimeout> | null = null;

  // 3. Initiate Connection
  clientSocket = TcpSocket.createConnection({ port, host: hostIp }, () => {
    // SUCCESS CALLBACK
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }

    /**
     * ✅ CRITICAL FIX:
     * We map the hostIp to this socket ONLY after the connection is established.
     * This allows the Client to reply to PINGs via sendToPeer(hostIp).
     */
    state.clientSockets.set(hostIp, clientSocket);

    devLog("Client", `Connected to host: ${hostIp}:${port}`);
  });

  // 4. Connection Timeout Guard (5s)
  connectionTimeout = setTimeout(() => {
    connectionTimeout = null;
    if (clientSocket && !clientSocket.destroyed) {
      devWarn("Client", `Connection to host timed out: ${hostIp}:${port}`);
      clientSocket.destroy();
      clientSocket = null;
    }
  }, 5000);

  // 5. Data Handling
  clientSocket.on("data", (data: any) => {
    const rawBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    state.hostBuffer = Buffer.concat([state.hostBuffer, rawBuffer]);

    const [packets, remaining] = extractFrames(state.hostBuffer);
    state.hostBuffer = remaining;

    for (const envelope of packets) {
      devLog(
        "Client",
        `Incoming ${envelope.packet?.type ?? "UNKNOWN"} from host ${hostIp}`,
      );
      packetHandler?.(envelope.packet, hostIp);
    }
  });

  // 6. Error Handling
  clientSocket.on("error", (error: any) => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
    console.error(`[TCP Transport] Host connection error:`, error?.message);
  });

  // 7. Disconnection & Auto-Reconnect
  clientSocket.on("close", () => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }

    /**
     * ✅ CLEANUP:
     * Remove the host from the socket map so we don't try to send
     * data through a dead pipe.
     */
    state.clientSockets.delete(hostIp);

    devLog("Client", `Disconnected from host: ${hostIp}`);
    clientSocket = null;

    // Only reconnect if the session is still active (state.hostIp matches)
    if (state.hostIp === hostIp) {
      const delay = 1500;
      devLog("Client", `Auto-reconnecting in ${delay}ms...`);
      setTimeout(() => {
        if (state.hostIp === hostIp) {
          connectToHost(hostIp, port);
        }
      }, delay);
    }
  });
};
// ── Safe send helper ──

const safeSend = (socket: any, framedData: Buffer, label: string, sessionId: number) => {
  // CRITICAL: Stop immediately if the session has changed or socket is dead
  if (sessionId !== currentSessionId) {
    devWarn("Send", `Ignoring send to ${label}: session mismatch (${sessionId} vs ${currentSessionId})`);
    return false;
  }

  if (!socket || socket.destroyed || socket._destroyed) {
    devWarn("Send", `Cannot send to ${label}: socket destroyed`);
    return false;
  }

  try {
    // Some versions of the native module throw asynchronously if the socket is gone
    // but the JS object doesn't know it yet.
    socket.write(framedData);
    return true;
  } catch (error: any) {
    const msg = error?.message || "";
    if (msg.includes("No socket with id")) {
       devWarn("Send", `Recovered from native socket crash (ID mismatch) for ${label}`);
    } else {
       devWarn("Send", `Send failed to ${label}:`, error);
    }
    return false;
  }
};

// ── Public API ──

export const GameSessionTransport = {
  start: async ({
    isHost,
    localPlayerId,
    hostIp = null,
    hostPort,
    onPacket,
  }: SessionConfig) => {
    devLog(
      "Lifecycle",
      `start() called — isHost=${isHost}, playerId=${localPlayerId}, hostIp=${hostIp}, hostPort=${hostPort ?? "default"}`,
    );

    // Clean up any previous session
    await GameSessionTransport.stop();
    
    currentSessionId++;
    const thisSessionId = currentSessionId;
    
    state.isHost = isHost;
    state.localPlayerId = localPlayerId;
    state.hostIp = hostIp;
    if (hostPort) {
      state.listeningPort = hostPort;
    }
    updateDebugMetric("hostIp", hostIp ?? (isHost ? "self-hosted" : "N/A"));
    packetHandler = onPacket;

    try {
      if (isHost) {
        await startTcpServer();
        // Double check session hasn't been stopped while we were starting the server
        if (thisSessionId !== currentSessionId) {
          throw new Error("Session cancelled during startup");
        }
        devLog(
          "Lifecycle",
          `Server started successfully on port ${state.listeningPort}`,
        );
      }
    } catch (error) {
      console.error("[TCP Transport] Failed to start server:", error);
      await GameSessionTransport.stop();
      throw error;
    }
    // Client connects lazily when setHostIp is called
  },

  stop: async (): Promise<boolean> => {
    if (pendingServerStopPromise) {
      return pendingServerStopPromise;
    }

    devLog("Lifecycle", "stop() called");
    
    // Invalidate the current session ID so all pending async work stops
    currentSessionId++; 
    const thisSessionId = currentSessionId;

    // Cancel any in-progress server start first
    if (serverRetryTimer) {
      clearTimeout(serverRetryTimer);
      serverRetryTimer = null;
    }
    pendingServerStartPromise = null;

    pendingServerStopPromise = new Promise((resolve) => {
      let finished = false;
      let closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

      const finish = (result: boolean) => {
        if (finished) {
          return;
        }

        finished = true;
        if (closeFallbackTimer) {
          clearTimeout(closeFallbackTimer);
          closeFallbackTimer = null;
        }

        performCleanup();
        pendingServerStopPromise = null;
        devLog("Lifecycle", `stop() finished — success=${result}`);
        resolve(result);
      };

      // 1. Handle Server Shutdown
      if (tcpServer) {
        devLog("Lifecycle", "Stopping active server...");
        try {
          // KICK EVERYONE IMMEDIATELY so the port closes faster
          state.clientSockets.forEach((socket) => {
            try {
              socket.destroy();
            } catch {
              /* ignore */
            }
          });
          state.clientSockets.clear();

          tcpServer.removeAllListeners();

          tcpServer.close(() => {
            devLog("Lifecycle", "Server port released.");
            tcpServer = null;
            finish(true);
          });
          // Give Android 800ms to release the port
          closeFallbackTimer = setTimeout(() => {
            devWarn("Lifecycle", "Server close timed out. Forcing cleanup.");
            tcpServer = null;
            finish(false);
          }, 800);
        } catch (e) {
          console.warn("[TCP Transport] Error closing server:", e);
          tcpServer = null;
          finish(false);
        }
      } else {
        finish(true);
      }

      // 2. Encapsulated State Cleanup
      function performCleanup() {
        // 🚀 CRITICAL: Null hostIp FIRST so the clientSocket's async 'close'
        // event guard (`state.hostIp === hostIp`) prevents a reconnect attempt
        // on a socket that is about to be destroyed. Without this, the timer
        // fires after destroy() and creates a new socket with a stale ID,
        // causing 'No socket with id 1000'.
        state.hostIp = null;

        // Close all client connections on the server side
        state.clientSockets.forEach((socket) => {
          try {
            socket.removeAllListeners();
            socket.destroy();
          } catch {
            /* ignore */
          }
        });

        // Close client-side connection
        if (clientSocket) {
          try {
            clientSocket.removeAllListeners();
            clientSocket.destroy();
          } catch {
            /* ignore */
          }
          clientSocket = null;
        }

        packetHandler = null;
        state.isHost = false;
        state.localPlayerId = "host_id";
        state.listeningPort = PRIMARY_PORT;
        state.clientSockets.clear();
        state.clientIps.clear();
        state.playerIdByIp.clear();
        state.ipByPlayerId.clear();
        state.clientBuffers.clear();
        state.hostBuffer = Buffer.alloc(0);
        pendingServerStartPromise = null;
        updateDebugMetric("hostIp", "N/A");
      }
    });

    return pendingServerStopPromise;
  },
  setHostIp: (hostIp: string | null, hostPort?: number) => {
    state.hostIp = hostIp;
    if (hostPort) {
      state.listeningPort = hostPort;
    }
    updateDebugMetric("hostIp", hostIp ?? "N/A");
    devLog(
      "Config",
      `Host IP set to ${hostIp ?? "N/A"}, port ${hostPort ?? state.listeningPort}`,
    );

    // Client: connect to host when IP is set
    if (hostIp && !state.isHost) {
      connectToHost(hostIp, hostPort);
    }
  },

  registerPeer: (playerId: string, ip: string) => {
    if (!playerId || !ip) return;

    state.clientIps.add(ip);
    state.playerIdByIp.set(ip, playerId);
    state.ipByPlayerId.set(playerId, ip);
    devLog("Peers", `Registered peer ${playerId} at ${ip}`);
  },

  unregisterPeer: (playerId: string) => {
    const ip = state.ipByPlayerId.get(playerId);
    if (!ip) return;

    state.ipByPlayerId.delete(playerId);
    state.playerIdByIp.delete(ip);
    state.clientIps.delete(ip);

    // Close the socket for this peer
    const socket = state.clientSockets.get(ip);
    if (socket) {
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      state.clientSockets.delete(ip);
      state.clientBuffers.delete(ip);
    }
    devLog("Peers", `Unregistered peer ${playerId} (was at ${ip})`);
  },

  getPlayerIdByIp: (ip: string) => state.playerIdByIp.get(ip),

  getIpByPlayerId: (playerId: string) => state.ipByPlayerId.get(playerId),

  /**
   * Returns the port the server is actually listening on.
   * May differ from NETWORK.TCP_SERVER_PORT if the primary port was busy.
   */
  getListeningPort: (): number => state.listeningPort,

  sendToHost: (packet: any) => {
    if (!state.hostIp) {
      console.warn(
        "[TCP Transport] Missing host IP for client packet",
        packet?.type,
      );
      return;
    }

    const framed = framePacket(packet);
    const sid = currentSessionId;

    if (clientSocket && !clientSocket.destroyed) {
      safeSend(clientSocket, framed, `host(${state.hostIp})`, sid);
    } else {
      devWarn("Send", "No active connection to host. Reconnecting...");
      // NET-2 FIX: reconnect first, then retry with backoff (300ms then 800ms)
      connectToHost(state.hostIp, state.listeningPort);
      const hostIpAtSend = state.hostIp;
      const retryDelays = [300, 800];
      retryDelays.forEach((delay) => {
        setTimeout(() => {
          // Verify both the socket AND the session are still valid
          if (
            clientSocket &&
            !clientSocket.destroyed &&
            state.hostIp === hostIpAtSend &&
            currentSessionId === sid
          ) {
            safeSend(clientSocket, framed, `host(${state.hostIp})`, sid);
          }
        }, delay);
      });
    }
  },

  sendToPeer: (ip: string, packet: any) => {
    const framed = framePacket(packet);
    const socket = state.clientSockets.get(ip);
    const sid = currentSessionId;

    if (socket) {
      safeSend(socket, framed, `peer(${ip})`, sid);
    } else {
      devWarn("Send", `No socket for peer: ${ip}`);
    }
  },

  sendToClients: (packet: any) => {
    const framed = framePacket(packet);
    const sid = currentSessionId;
    state.clientSockets.forEach((socket, ip) => {
      safeSend(socket, framed, `client(${ip})`, sid);
    });
  },

  getSnapshot: (): SessionSnapshot => ({
    isHost: state.isHost,
    localPlayerId: state.localPlayerId,
    hostIp: state.hostIp,
    clientIps: Array.from(state.clientIps),
    listeningPort: state.listeningPort,
  }),

  /**
   * Check if a TCP socket is alive for a given IP.
   * Used for AP Isolation detection.
   */
  isConnectedTo: (ip: string): boolean => {
    if (state.isHost) {
      const socket = state.clientSockets.get(ip);
      return socket != null && !socket.destroyed;
    }
    return clientSocket != null && !clientSocket.destroyed;
  },

  /**
   * Attempt to reconnect to a peer (Fast Reconnect for reliability layer).
   */
  reconnectToHost: (): boolean => {
    if (state.isHost || !state.hostIp) return false;

    try {
      connectToHost(state.hostIp, state.listeningPort);
      return true;
    } catch {
      return false;
    }
  },
};
