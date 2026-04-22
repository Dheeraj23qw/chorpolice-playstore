import { NETWORK } from "../../constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";

type HeartbeatCallbacks = {
  onPing: (packet: any) => void;
  onStale: (ip: string) => void;
  onApIsolation?: () => void;
};

type ReconnectTracker = {
  missed: number;
};

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
const pongTrackers: Map<string, ReconnectTracker> = new Map();
let callbacks: HeartbeatCallbacks | null = null;

const HEARTBEAT_INTERVAL = NETWORK.HEARTBEAT_INTERVAL || 3000;

export const HeartbeatService = {
  start: (nextCallbacks: HeartbeatCallbacks) => {
    callbacks = nextCallbacks;

    if (heartbeatInterval) return;

    updateDebugMetric("isHeartbeatActive", true);

    heartbeatInterval = setInterval(() => {
      const packet = { type: NETWORK.PING, timestamp: Date.now() };
      callbacks?.onPing(packet);

      Array.from(pongTrackers.entries()).forEach(([ip, tracker]) => {
        tracker.missed += 1;

        // NET-5 FIX: removed confused reconnectToHost() call from host's heartbeat loop.
        // The host can't reconnect TO clients — it's a server. Clients auto-reconnect
        // via the TCP close handler. The host only needs to detect staleness and evict.

        // ── AP ISOLATION DETECTION ──
        // After RECONNECT_ATTEMPTS worth of missed pings with no pong,
        // the client is likely behind AP isolation (same Wi-Fi, no peer traffic)
        if (tracker.missed === NETWORK.RECONNECT_ATTEMPTS + 1) {
          if (__DEV__) console.warn(`[Heartbeat] Possible AP Isolation for ${ip}`);
          callbacks?.onApIsolation?.();
        }

        // ── STALE PEER DETECTION ──
        // After HEARTBEAT_MISS_THRESHOLD missed pings, the peer is declared gone.
        if (tracker.missed >= NETWORK.HEARTBEAT_MISS_THRESHOLD + NETWORK.RECONNECT_ATTEMPTS) {
          if (__DEV__) console.log(`[Heartbeat] Peer ${ip} declared stale after ${tracker.missed} missed pings`);
          callbacks?.onStale(ip);
          pongTrackers.delete(ip); // prevent repeated triggers
        }
      });
    }, HEARTBEAT_INTERVAL);
  },

  addClient: (ip: string) => {
    if (!ip) return;
    if (!pongTrackers.has(ip)) {
      pongTrackers.set(ip, { missed: 0 });
    }
  },

  removeClient: (ip: string) => {
    if (!ip) return;

    pongTrackers.delete(ip);
  },

  resetTracker: (ip: string) => {
    if (!ip) return;
    const tracker = pongTrackers.get(ip);
    if (tracker) tracker.missed = 0;
  },

  stop: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    pongTrackers.clear();
    callbacks = null;

    updateDebugMetric("isHeartbeatActive", false);
  },
};
