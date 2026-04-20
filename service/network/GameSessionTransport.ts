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
  onPacket: PacketHandler;
};

type SessionSnapshot = {
  isHost: boolean;
  localPlayerId: string;
  hostIp: string | null;
  clientIps: string[];
};

type PacketEnvelope = {
  version: string;
  packet: any;
};

const SESSION_PORT = NETWORK.TCP_SERVER_PORT;

let tcpServer: any = null;
let clientSocket: any = null;
let packetHandler: PacketHandler | null = null;

const state = {
  isHost: false,
  localPlayerId: "host_id",
  hostIp: null as string | null,
  clientSockets: new Map<string, any>(), // ip -> socket
  clientIps: new Set<string>(),
  playerIdByIp: new Map<string, string>(),
  ipByPlayerId: new Map<string, string>(),
  clientBuffers: new Map<string, Buffer>(), // ip -> partial data buffer
  hostBuffer: Buffer.alloc(0), // partial data buffer for client side
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
const extractFrames = (
  buffer: Buffer,
): [PacketEnvelope[], Buffer] => {
  const packets: PacketEnvelope[] = [];
  let offset = 0;

  while (offset + 4 <= buffer.length) {
    const payloadLength = buffer.readUInt32BE(offset);

    // Sanity check: reject absurdly large frames (> 1MB)
    if (payloadLength > 1_048_576) {
      if (__DEV__) {
        console.warn(
          `[TCP Transport] Rejecting oversized frame (${payloadLength} bytes). Resetting buffer.`,
        );
      }
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
      } else if (__DEV__) {
        console.warn(
          `[TCP Transport] Dropping packet with mismatched version: ${envelope?.version}`,
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("[TCP Transport] Frame parse error:", error);
      }
    }

    offset += 4 + payloadLength;
  }

  const remaining = buffer.slice(offset);
  return [packets, remaining];
};

// ── TCP Server (Host) ──

const startTcpServer = () => {
  if (tcpServer) return;

  tcpServer = TcpSocket.createServer((socket: any) => {
    const remoteIp: string =
      socket.remoteAddress?.replace("::ffff:", "") || "unknown";
    const remotePort: number = socket.remotePort || 0;

    if (__DEV__) {
      console.log(
        `[TCP Transport] Client connected: ${remoteIp}:${remotePort}`,
      );
    }

    state.clientSockets.set(remoteIp, socket);
    state.clientIps.add(remoteIp);
    state.clientBuffers.set(remoteIp, Buffer.alloc(0));

    socket.on("data", (data: any) => {
      const rawBuffer = Buffer.isBuffer(data)
        ? data
        : Buffer.from(data);

      const existingBuffer = state.clientBuffers.get(remoteIp) || Buffer.alloc(0);
      const combined = Buffer.concat([existingBuffer, rawBuffer]);
      const [packets, remaining] = extractFrames(combined);
      state.clientBuffers.set(remoteIp, remaining);

      for (const envelope of packets) {
        if (__DEV__) {
          console.log(
            `[TCP Transport] Incoming ${envelope.packet?.type ?? "UNKNOWN"} from ${remoteIp}`,
          );
        }
        packetHandler?.(envelope.packet, remoteIp);
      }
    });

    socket.on("error", (error: any) => {
      if (__DEV__) {
        console.warn(`[TCP Transport] Client socket error (${remoteIp}):`, error?.message);
      }
    });

    socket.on("close", () => {
      if (__DEV__) {
        console.log(`[TCP Transport] Client disconnected: ${remoteIp}`);
      }
      state.clientSockets.delete(remoteIp);
      state.clientBuffers.delete(remoteIp);
      // Note: we don't remove from clientIps/playerIdByIp here
      // because the HeartbeatService handles stale peer removal
    });
  });

  tcpServer.on("error", (error: any) => {
    console.error("[TCP Transport] Server error:", error);
  });

  tcpServer.listen({ port: SESSION_PORT, host: "0.0.0.0" }, () => {
    if (__DEV__) {
      console.log(`[TCP Transport] Server listening on 0.0.0.0:${SESSION_PORT}`);
    }
  });
};

// ── TCP Client ──

const connectToHost = (hostIp: string) => {
  if (clientSocket) {
    try {
      clientSocket.destroy();
    } catch {
      // ignore
    }
    clientSocket = null;
  }

  state.hostBuffer = Buffer.alloc(0);

  clientSocket = TcpSocket.createConnection(
    {
      port: SESSION_PORT,
      host: hostIp,
    },
    () => {
      clearTimeout(connectionTimeout);
      if (__DEV__) {
        console.log(`[TCP Transport] Connected to host: ${hostIp}:${SESSION_PORT}`);
      }
    },
  );

  // Manual connection timeout
  const connectionTimeout = setTimeout(() => {
    if (clientSocket && !clientSocket.destroyed) {
      if (__DEV__) {
        console.warn(`[TCP Transport] Connection to host timed out: ${hostIp}`);
      }
      clientSocket.destroy();
      clientSocket = null;
    }
  }, 5000);

  clientSocket.on("data", (data: any) => {
    const rawBuffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(data);

    state.hostBuffer = Buffer.concat([state.hostBuffer, rawBuffer]);
    const [packets, remaining] = extractFrames(state.hostBuffer);
    state.hostBuffer = remaining;

    for (const envelope of packets) {
      if (__DEV__) {
        console.log(
          `[TCP Transport] Incoming ${envelope.packet?.type ?? "UNKNOWN"} from host ${hostIp}`,
        );
      }
      packetHandler?.(envelope.packet, hostIp);
    }
  });

  clientSocket.on("error", (error: any) => {
    clearTimeout(connectionTimeout);
    console.error(`[TCP Transport] Host connection error:`, error?.message);
  });

  clientSocket.on("close", () => {
    clearTimeout(connectionTimeout);
    if (__DEV__) {
      console.log(`[TCP Transport] Disconnected from host: ${hostIp}`);
    }
    clientSocket = null;
  });
};

// ── Safe send helper ──

const safeSend = (socket: any, framedData: Buffer, label: string) => {
  if (!socket || socket.destroyed) {
    if (__DEV__) {
      console.warn(`[TCP Transport] Cannot send to ${label}: socket destroyed`);
    }
    return false;
  }

  try {
    socket.write(framedData);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn(`[TCP Transport] Send failed to ${label}:`, error);
    }
    return false;
  }
};

// ── Public API ──

export const GameSessionTransport = {
  start: ({
    isHost,
    localPlayerId,
    hostIp = null,
    onPacket,
  }: SessionConfig) => {
    // Clean up any previous session
    GameSessionTransport.stop();

    state.isHost = isHost;
    state.localPlayerId = localPlayerId;
    state.hostIp = hostIp;
    updateDebugMetric("hostIp", hostIp ?? (isHost ? "self-hosted" : "N/A"));
    packetHandler = onPacket;

    if (isHost) {
      startTcpServer();
    }
    // Client connects lazily when setHostIp is called
  },

  stop: () => {
    // Stop server
    if (tcpServer) {
      try {
        tcpServer.close();
      } catch {
        // ignore close races
      }
      tcpServer = null;
    }

    // Close all client connections on the server side
    state.clientSockets.forEach((socket) => {
      try {
        socket.destroy();
      } catch {
        // ignore
      }
    });

    // Close client-side connection
    if (clientSocket) {
      try {
        clientSocket.destroy();
      } catch {
        // ignore
      }
      clientSocket = null;
    }

    packetHandler = null;
    state.isHost = false;
    state.localPlayerId = "host_id";
    state.hostIp = null;
    state.clientSockets.clear();
    state.clientIps.clear();
    state.playerIdByIp.clear();
    state.ipByPlayerId.clear();
    state.clientBuffers.clear();
    state.hostBuffer = Buffer.alloc(0);
    updateDebugMetric("hostIp", "N/A");
  },

  setHostIp: (hostIp: string | null) => {
    state.hostIp = hostIp;
    updateDebugMetric("hostIp", hostIp ?? "N/A");

    if (__DEV__) {
      console.log(
        `[TCP Transport] Session host IP set to ${hostIp ?? "N/A"}`,
      );
    }

    // Client: connect to host when IP is set
    if (hostIp && !state.isHost) {
      connectToHost(hostIp);
    }
  },

  registerPeer: (playerId: string, ip: string) => {
    if (!playerId || !ip) return;

    state.clientIps.add(ip);
    state.playerIdByIp.set(ip, playerId);
    state.ipByPlayerId.set(playerId, ip);
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
  },

  getPlayerIdByIp: (ip: string) => state.playerIdByIp.get(ip),

  getIpByPlayerId: (playerId: string) => state.ipByPlayerId.get(playerId),

  sendToHost: (packet: any) => {
    if (!state.hostIp) {
      console.warn(
        "[TCP Transport] Missing host IP for client packet",
        packet?.type,
      );
      return;
    }

    const framed = framePacket(packet);

    if (clientSocket) {
      safeSend(clientSocket, framed, `host(${state.hostIp})`);
    } else {
      if (__DEV__) {
        console.warn(
          "[TCP Transport] No active connection to host. Reconnecting...",
        );
      }
      connectToHost(state.hostIp);
      // Queue a retry after connection establishes
      setTimeout(() => {
        if (clientSocket) {
          safeSend(clientSocket, framed, `host(${state.hostIp})`);
        }
      }, 500);
    }
  },

  sendToPeer: (ip: string, packet: any) => {
    const framed = framePacket(packet);
    const socket = state.clientSockets.get(ip);

    if (socket) {
      safeSend(socket, framed, `peer(${ip})`);
    } else if (__DEV__) {
      console.warn(`[TCP Transport] No socket for peer: ${ip}`);
    }
  },

  sendToClients: (packet: any) => {
    const framed = framePacket(packet);
    state.clientSockets.forEach((socket, ip) => {
      safeSend(socket, framed, `client(${ip})`);
    });
  },

  getSnapshot: (): SessionSnapshot => ({
    isHost: state.isHost,
    localPlayerId: state.localPlayerId,
    hostIp: state.hostIp,
    clientIps: Array.from(state.clientIps),
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
      connectToHost(state.hostIp);
      return true;
    } catch {
      return false;
    }
  },
};
