import dgram from "react-native-udp";

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

let socket: any = null;
let packetHandler: PacketHandler | null = null;

const state = {
  isHost: false,
  localPlayerId: "host_id",
  hostIp: null as string | null,
  clientIps: new Set<string>(),
  playerIdByIp: new Map<string, string>(),
  ipByPlayerId: new Map<string, string>(),
};

const parseEnvelope = (raw: any): PacketEnvelope | null => {
  try {
    const data = JSON.parse(raw.toString());
    if (
      !data ||
      typeof data !== "object" ||
      data.version !== NETWORK.PROTOCOL_VERSION ||
      !data.packet
    ) {
      return null;
    }

    return data as PacketEnvelope;
  } catch {
    return null;
  }
};

const ensureSocket = () => {
  if (socket) {
    return socket;
  }

  socket = dgram.createSocket({
    type: "udp4",
    reusePort: true,
    debug: __DEV__,
  }) as any;

  socket.on("listening", () => {
    try {
      socket.setBroadcast(true);
      const address = socket.address?.();
      if (__DEV__) {
        console.log(
          `[LAN Transport] Bound on ${address?.address ?? "0.0.0.0"}:${address?.port ?? SESSION_PORT}`,
        );
      }
    } catch (error) {
      console.error("[LAN Transport] Failed to enable broadcast", error);
    }
  });

  socket.on("message", (msg: any, rinfo: any) => {
    const envelope = parseEnvelope(msg);
    if (!envelope) {
      return;
    }

    if (!state.isHost && !state.hostIp) {
      state.hostIp = rinfo.address;
      updateDebugMetric("hostIp", rinfo.address);
    }

    if (__DEV__) {
      console.log(
        `[LAN Transport] Incoming ${envelope.packet?.type ?? "UNKNOWN"} from ${rinfo.address}`,
      );
    }

    packetHandler?.(envelope.packet, rinfo.address);
  });

  socket.on("error", (error: any) => {
    if (!error?.message?.includes("closed")) {
      console.error("[LAN Transport] Socket error", error);
    }
  });

  socket.bind(SESSION_PORT);
  return socket;
};

const sendPacket = (targetIp: string, packet: any) => {
  if (!targetIp) {
    return;
  }

  const activeSocket = ensureSocket();
  const payload = JSON.stringify({
    version: NETWORK.PROTOCOL_VERSION,
    packet,
  });

  try {
    activeSocket.send(payload, 0, payload.length, SESSION_PORT, targetIp);

    if (__DEV__) {
      console.log(
        `[LAN Transport] Sent ${packet?.type ?? "UNKNOWN"} to ${targetIp}:${SESSION_PORT}`,
      );
    }
  } catch (error) {
    console.error("[LAN Transport] Failed to send packet", targetIp, error);
  }
};

export const GameSessionTransport = {
  start: ({ isHost, localPlayerId, hostIp = null, onPacket }: SessionConfig) => {
    state.isHost = isHost;
    state.localPlayerId = localPlayerId;
    state.hostIp = hostIp;
    updateDebugMetric("hostIp", hostIp ?? (isHost ? "self-hosted" : "N/A"));
    packetHandler = onPacket;
    ensureSocket();
  },

  stop: () => {
    if (socket) {
      try {
        socket.close();
      } catch {
        // ignore close races
      }
      socket = null;
    }

    packetHandler = null;
    state.isHost = false;
    state.localPlayerId = "host_id";
    state.hostIp = null;
    state.clientIps.clear();
    state.playerIdByIp.clear();
    state.ipByPlayerId.clear();
    updateDebugMetric("hostIp", "N/A");
  },

  setHostIp: (hostIp: string | null) => {
    state.hostIp = hostIp;
    updateDebugMetric("hostIp", hostIp ?? "N/A");

    if (__DEV__) {
      console.log(`[LAN Transport] Session host IP set to ${hostIp ?? "N/A"}`);
    }
  },

  registerPeer: (playerId: string, ip: string) => {
    if (!playerId || !ip) {
      return;
    }

    state.clientIps.add(ip);
    state.playerIdByIp.set(ip, playerId);
    state.ipByPlayerId.set(playerId, ip);
  },

  unregisterPeer: (playerId: string) => {
    const ip = state.ipByPlayerId.get(playerId);
    if (!ip) {
      return;
    }

    state.ipByPlayerId.delete(playerId);
    state.playerIdByIp.delete(ip);
    state.clientIps.delete(ip);
  },

  getPlayerIdByIp: (ip: string) => state.playerIdByIp.get(ip),

  getIpByPlayerId: (playerId: string) => state.ipByPlayerId.get(playerId),

  sendToHost: (packet: any) => {
    if (!state.hostIp) {
      console.warn(
        "[LAN Transport] Missing host IP for client packet",
        packet?.type,
      );
      return;
    }
    sendPacket(state.hostIp, packet);
  },

  sendToPeer: (ip: string, packet: any) => {
    sendPacket(ip, packet);
  },

  sendToClients: (packet: any) => {
    state.clientIps.forEach((ip) => sendPacket(ip, packet));
  },

  getSnapshot: (): SessionSnapshot => ({
    isHost: state.isHost,
    localPlayerId: state.localPlayerId,
    hostIp: state.hostIp,
    clientIps: Array.from(state.clientIps),
  }),
};
