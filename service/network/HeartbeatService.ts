import { NETWORK } from "../../constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";

/**
 * --- HEARTBEAT SERVICE ---
 * Adheres to SRP.
 * Manages connection health checks for the LAN session.
 */

let heartbeatInterval: any = null;
const pongTrackers: Map<string, number> = new Map(); 

export const HeartbeatService = {
  /**
   * Starts the heartbeat mechanism on the Host device.
   */
  start: (clients: string[], onPing: (packet: any) => void) => {
    if (heartbeatInterval) return;
    
    console.log("💓 [Heartbeat] Service Started.");
    updateDebugMetric("isHeartbeatActive", true);

    heartbeatInterval = setInterval(() => {
      const packet = { type: NETWORK.PING, timestamp: Date.now() };
      
      // Monitor client health
      clients.forEach(ip => {
        const missed = (pongTrackers.get(ip) || 0) + 1;
        pongTrackers.set(ip, missed);
        
        if (missed >= 3) {
          console.warn(`[WARNING] Connection to ${ip} is stale. (Missed ${missed} PONGs)`);
        }
      });

      // Notify the networking layer to broadcast
      onPing(packet);
    }, 3000);
  },

  /**
   * Resets the missed pong count for a specific client.
   */
  resetTracker: (ip: string) => {
    pongTrackers.set(ip, 0);
  },

  /**
   * Stops the heartbeat mechanism.
   */
  stop: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      updateDebugMetric("isHeartbeatActive", false);
      console.log("💓 [Heartbeat] Service Stopped.");
    }
  }
};
