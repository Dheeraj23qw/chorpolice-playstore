import { NETWORK } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { updateDebugMetric } from "./observability/DebugService";
import { HeartbeatService } from "./network/HeartbeatService";

/**
 * --- LAN GAME SERVICE (Network Layer) ---
 * Adheres to SOLID Principles.
 * Responsibility: Low-level packet reception and dispatching.
 */

// 🔀 Register broadcast handler
PacketRouter.setBroadcastHandler((packet) => {
  handleIncomingPacket(packet);
});

type PacketListener = (packet: any) => void;
const listeners: Set<PacketListener> = new Set();

/**
 * Subscribes a component directly to the raw packet stream. (Used for Lobby)
 */
export const subscribeToPackets = (listener: PacketListener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/**
 * 🧹 Clears ALL packet listeners.
 * WHY: Prevents ghost listeners from a crashed/unmounted game session
 * from processing packets in the next session.
 */
export const clearAllListeners = () => {
  console.log(`🧹 [LAN] Clearing ${listeners.size} stale packet listeners.`);
  listeners.clear();
};

/**
 * --- PACKET AUDIT & DISPATCH ---
 */
const debugLogger = (role: string, packet: any, metadata: string = "N/A") => {
  if (!__DEV__) return;
  const timestamp = new Date().toISOString();
  const summary = JSON.stringify(packet).substring(0, 100);
  console.log(`[DEBUG][${timestamp}][${role}][${packet.type}][${summary}] - Meta: ${metadata}`);
};

/**
 * Entry point for ALL network traffic (Local or Remote).
 * WHY: Adheres to defensive programming. Validates payloads before routing.
 */
export const handleIncomingPacket = (packet: any, sourceIp?: string) => {
  // 🛡️ PAYLOAD GUARD: Prevent crashes from malformed packets
  if (!packet || typeof packet !== 'object' || !packet.type) {
    if (__DEV__) console.warn("⚠️ [Network] Received malformed or empty packet. Ignoring.", packet);
    return;
  }

  // 1. Metrics & Logs
  debugLogger("RECEIVER", packet, sourceIp || "LOCAL");
  updateDebugMetric("lastPacketType", packet.type);

  // 2. Protocol Handlers (Ping/Pong)
  if (packet.type === NETWORK.PING) {
    handleIncomingPacket({ type: NETWORK.PONG, timestamp: packet.timestamp }); 
    return;
  }

  if (packet.type === NETWORK.PONG) {
    const now = Date.now();
    updateDebugMetric("latency", now - (packet.timestamp || now));
    if (sourceIp) HeartbeatService.resetTracker(sourceIp);
    return;
  }

  // 3. Notify High-Level Listeners (Hooks/Lobby)
  listeners.forEach(l => l(packet));

  // 4. Delegate to Game Engine(s) via Router
  PacketRouter.route(packet, sourceIp);
};

/**
 * --- SESSION CONTROLS ---
 */
export const startHeartbeat = (isHost: boolean, clients: string[]) => {
  if (!isHost) return;
  HeartbeatService.start(clients, (packet) => {
    // Notify local listener to simulate real broadcast
    listeners.forEach(l => l(packet));
  });
};

export const stopHeartbeat = () => {
  HeartbeatService.stop();
};

// Re-export debug data from its dedicated service for backward compatibility
export { useDebugData, debugState } from "./observability/DebugService";
