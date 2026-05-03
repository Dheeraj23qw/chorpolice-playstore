import { NETWORK } from "../../constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";
import { normalizePeerIp } from "./normalizePeerIp";

type HeartbeatCallbacks = {
  onPing: (packet: any) => void;
  onStale: (ip: string) => void;
  onApIsolation?: () => void;
  /** Injected socket-liveness check to avoid circular import */
  isConnectedTo?: (ip: string) => boolean;
};

type ReconnectTracker = {
  missed: number;
  lastSeenAt: number;
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
        const now = Date.now();
        const timeSinceLastSeen = now - tracker.lastSeenAt;

        // ── AP ISOLATION DETECTION ──
        // Only warn if we've missed several pings AND haven't seen any data for 10+ seconds.
        if (tracker.missed === NETWORK.RECONNECT_ATTEMPTS + 1 && timeSinceLastSeen > 10000) {
          if (__DEV__) {
            console.warn(`[Heartbeat] ⚠️ Possible AP Isolation for ${ip} (missed: ${tracker.missed}, no data for: ${Math.floor(timeSinceLastSeen/1000)}s)`);
          }
          callbacks?.onApIsolation?.();
        }

        // ── STALE PEER DETECTION ──
        // Rely on absolute time rather than just tick counts to prevent
        // false positives during temporary lag spikes.
        if (timeSinceLastSeen > 15000) {
          // FIX-4: Before declaring stale, check if TCP socket is actually still alive.
          if (callbacks?.isConnectedTo?.(ip)) {
            if (__DEV__) console.log(`[Heartbeat] Stale check SKIPPED for ${ip}: TCP socket still alive (lastSeen ${Math.floor(timeSinceLastSeen/1000)}s ago). Resetting tracker.`);
            tracker.missed = 0;
            tracker.lastSeenAt = Date.now();
            return;
          }
          if (__DEV__) console.log(`[Heartbeat] Peer ${ip} declared stale (last seen ${Math.floor(timeSinceLastSeen/1000)}s ago, socket dead)`);
          callbacks?.onStale(ip);
          pongTrackers.delete(ip); // prevent repeated triggers
        }
      });
    }, HEARTBEAT_INTERVAL);
  },

  addClient: (rawIp: string) => {
    if (!rawIp) return;
    const ip = normalizePeerIp(rawIp) || rawIp;
    if (!pongTrackers.has(ip)) {
      if (__DEV__) console.log(`[Heartbeat] Adding tracker for ${ip}`);
      pongTrackers.set(ip, { missed: 0, lastSeenAt: Date.now() });
    }
  },

  removeClient: (rawIp: string) => {
    if (!rawIp) return;
    const ip = normalizePeerIp(rawIp) || rawIp;
    if (__DEV__ && pongTrackers.has(ip)) console.log(`[Heartbeat] Removing tracker for ${ip}`);
    pongTrackers.delete(ip);
  },

  resetTracker: (rawIp: string) => {
    if (!rawIp) return;
    const ip = normalizePeerIp(rawIp) || rawIp;
    const tracker = pongTrackers.get(ip);
    if (tracker) {
      if (tracker.missed > 0 && __DEV__) {
        // devLog-style but using console for visibility in heartbeat
        console.log(`[Heartbeat] reset tracker for ${ip} (was missed: ${tracker.missed})`);
      }
      tracker.missed = 0;
      tracker.lastSeenAt = Date.now();
    }
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
