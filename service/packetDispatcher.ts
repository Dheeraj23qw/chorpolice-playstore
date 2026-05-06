/**
 * --- PACKET DISPATCHER ---
 * 
 * WHY: This module acts as a lightweight bridge layer to break circular dependencies
 * between networking services (lanGameService) and gameplay logic (BotBehavior).
 * 
 * Rules:
 * - This module MUST NOT import lanGameService.
 * - This module MUST NOT import gameplay engines.
 * - It only manages a registry of handlers.
 */

type PacketHandler = (packet: any, sourceIp?: string) => void;

let incomingHandler: PacketHandler | null = null;
const genericListeners: Set<PacketHandler> = new Set();

/**
 * Registers the primary entry point for incoming network packets.
 * Usually called by lanGameService to connect the transport to the game logic.
 */
export const registerIncomingPacketHandler = (fn: PacketHandler) => {
  incomingHandler = fn;
};

/**
 * Dispatches a packet as if it were received from the network.
 * Useful for bots or local simulation to inject packets into the engine.
 */
export const dispatchPacket = (packet: any, sourceIp?: string) => {
  if (__DEV__) {
    console.log(`📡 [Dispatcher] Dispatching: ${packet?.type} (Has Handler: ${!!incomingHandler})`);
  }
  if (incomingHandler) {
    incomingHandler(packet, sourceIp);
  } else {
    notifyGenericListeners(packet, sourceIp);
  }
};

/**
 * Notifies only the generic listeners. 
 * Use this inside the main incoming handler to avoid recursion.
 */
export const notifyGenericListeners = (packet: any, sourceIp?: string) => {
  genericListeners.forEach(listener => listener(packet, sourceIp));
};

/**
 * Adds a generic listener for ALL incoming packets.
 * Useful for decoupled systems (like bots) to observe the packet stream
 * without importing the networking service.
 */
export const subscribeToDispatch = (fn: PacketHandler) => {
  genericListeners.add(fn);
  return () => {
    genericListeners.delete(fn);
  };
};
