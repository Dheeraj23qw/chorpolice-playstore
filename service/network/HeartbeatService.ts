import { NETWORK } from "../../constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";
import { GameSessionTransport } from "./GameSessionTransport";

type HeartbeatCallbacks = {
  onPing: (packet: any) => void;
  onStale: (ip: string) => void;
  onApIsolation?: () => void;
};

type ReconnectTracker = {
  missed: number;
  reconnectAttempts: number;
  isReconnecting: boolean;
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

        // ── FAST RECONNECT ──
        if (
          tracker.missed >= 2 &&
          !tracker.isReconnecting &&
          tracker.reconnectAttempts < NETWORK.RECONNECT_ATTEMPTS
        ) {
          tracker.isReconnecting = true;
          tracker.reconnectAttempts += 1;

          if (__DEV__) {
            console.log(
              `[Heartbeat] Reconnect attempt ${tracker.reconnectAttempts}/${NETWORK.RECONNECT_ATTEMPTS} for ${ip}`,
            );
          }

          const isAlive = GameSessionTransport.isConnectedTo(ip);

          if (!isAlive) {
            const didReconnect = GameSessionTransport.reconnectToHost();

            if (!didReconnect && __DEV__) {
              console.warn(`[Heartbeat] Reconnect failed for ${ip}`);
            }
          }

          tracker.isReconnecting = false;
        }

        // ── AP ISOLATION DETECTION ──
        if (
          tracker.reconnectAttempts >= NETWORK.RECONNECT_ATTEMPTS &&
          tracker.missed >= 2 + NETWORK.RECONNECT_ATTEMPTS
        ) {
          if (__DEV__) {
            console.warn(`[Heartbeat] Possible AP Isolation detected`);
          }
          callbacks?.onApIsolation?.();
        }

        // ── STALE PEER DETECTION ──
        if (
          tracker.missed >= 3 + NETWORK.RECONNECT_ATTEMPTS &&
          tracker.reconnectAttempts >= NETWORK.RECONNECT_ATTEMPTS
        ) {
          if (__DEV__) {
            console.log(`[Heartbeat] Peer ${ip} declared stale`);
          }

          callbacks?.onStale(ip);

          // 🔥 IMPORTANT: remove to prevent repeated triggers
          pongTrackers.delete(ip);
        }
      });
    }, HEARTBEAT_INTERVAL);
  },

  addClient: (ip: string) => {
    if (!ip) return;

    // prevent duplicate trackers
    if (!pongTrackers.has(ip)) {
      pongTrackers.set(ip, {
        missed: 0,
        reconnectAttempts: 0,
        isReconnecting: false,
      });
    }
  },

  removeClient: (ip: string) => {
    if (!ip) return;

    pongTrackers.delete(ip);
  },

  resetTracker: (ip: string) => {
    if (!ip) return;

    const tracker = pongTrackers.get(ip);
    if (!tracker) return;

    tracker.missed = 0;
    tracker.reconnectAttempts = 0;
    tracker.isReconnecting = false;
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
