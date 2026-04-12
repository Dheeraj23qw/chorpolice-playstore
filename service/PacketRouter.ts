import { IGameEngine } from "./interfaces/IGameEngine";

let broadcastCallback: ((packet: any) => void) | null = null;
const engines: Set<IGameEngine> = new Set();

/**
 * --- PACKET ROUTER (Registry Implementation) ---
 * WHY: Adheres to Open/Closed Principle (OCP).
 * Engines register themselves here, making the system extensible
 * without modifying the core routing logic.
 */
export const PacketRouter = {
  /**
   * Registers a game engine to the routing system.
   */
  registerEngine: (engine: IGameEngine) => {
    console.log("🧩 [Router] Registering Engine:", engine.constructor.name || "Anonymous Engine");
    engines.add(engine);
  },

  /**
   * Removes an engine from the registry.
   */
  unregisterEngine: (engine: IGameEngine) => {
    engines.delete(engine);
  },

  /**
   * Sets the handler for packets going BACK to the network.
   */
  setBroadcastHandler: (cb: (packet: any) => void) => {
    broadcastCallback = cb;
  },

  /**
   * Broadcasts a locally generated packet to the network.
   */
  broadcast: (packet: any) => {
    if (broadcastCallback) {
      broadcastCallback(packet);
    } else {
      console.warn("⚠️ [PacketRouter] No broadcast handler attached!");
    }
  },

  /**
   * Routes an incoming packet to the correct registered engine.
   */
  route: (packet: any, sourceIp?: string) => {
    if (!packet || !packet.type) return;

    let handled = false;
    engines.forEach((engine) => {
      if (engine.canHandle(packet.type)) {
        engine.processMultiplayer(packet, sourceIp);
        handled = true;
      }
    });

    if (__DEV__ && !handled && !packet.type.startsWith("NETWORK_")) {
      // networking packets (PING/PONG) are handled by lanGameService, no need to warn
      // console.log(`[Router] No engine registered for packet type: ${packet.type}`);
    }
  }
};
