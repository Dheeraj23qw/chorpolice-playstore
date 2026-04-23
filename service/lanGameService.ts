import { NETWORK } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { updateDebugMetric } from "./observability/DebugService";
import { HeartbeatService } from "./network/HeartbeatService";
import { GameSessionTransport } from "./network/GameSessionTransport";

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
  listeners.forEach((listener) => listener(packet, sourceIp));
};

PacketRouter.setBroadcastHandler((packet) => {
  handleIncomingPacket(packet);

  if (GameSessionTransport.getSnapshot().isHost) {
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

export const configureSession = ({
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
  GameSessionTransport.sendToHost(packet);
};

export const sendPacketToPeer = (ip: string, packet: any) => {
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

  if (GameSessionTransport.getSnapshot().isHost) {
    GameSessionTransport.sendToClients(packet);
  }
};

export const stopSession = async () => {
  HeartbeatService.stop();
  await GameSessionTransport.stop();
};

export const handleIncomingPacket = (packet: any, sourceIp?: string) => {
  if (!packet || typeof packet !== "object" || !packet.type) {
    if (__DEV__) {
      console.warn("⚠️ [Network] Received malformed or empty packet. Ignoring.", packet);
    }
    return;
  }

  debugLogger("RECEIVER", packet, sourceIp || "LOCAL");
  updateDebugMetric("lastPacketType", packet.type);

  if (packet.type === NETWORK.PING) {
    notifyListeners(packet, sourceIp);
    if (sourceIp) {
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
    if (sourceIp) {
      HeartbeatService.resetTracker(sourceIp);
    }
    return;
  }

  if (
    packet.type === NETWORK.PLAYER_LEAVE &&
    packet.playerId &&
    GameSessionTransport.getSnapshot().isHost
  ) {
    unregisterRemotePeer(packet.playerId);
  }

  notifyListeners(packet, sourceIp);
  PacketRouter.route(packet, sourceIp);
};

let apIsolationCallback: (() => void) | null = null;

export const setApIsolationHandler = (handler: (() => void) | null) => {
  apIsolationCallback = handler;
};

export const startHeartbeat = (isHost: boolean) => {
  if (!isHost) {
    return;
  }

  HeartbeatService.start({
    onPing: (packet) => {
      GameSessionTransport.sendToClients(packet);
    },
    onStale: (ip) => {
      const playerId = GameSessionTransport.getPlayerIdByIp(ip);
      if (!playerId) {
        HeartbeatService.removeClient(ip);
        return;
      }

      const leavePacket = {
        type: NETWORK.PLAYER_LEAVE,
        playerId,
        reason: "heartbeat_timeout",
      };

      unregisterRemotePeer(playerId);
      GameSessionTransport.sendToClients(leavePacket);
      handleIncomingPacket(leavePacket, ip);
    },
    onApIsolation: () => {
      if (__DEV__) {
        console.warn("[LAN] AP Isolation detected — TCP failed on same Wi-Fi");
      }
      apIsolationCallback?.();
    },
  });
};

export const stopHeartbeat = () => {
  HeartbeatService.stop();
};

export { useDebugData, debugState } from "./observability/DebugService";
