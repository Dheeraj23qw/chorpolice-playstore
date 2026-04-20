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

export const HeartbeatService = {
  start: (nextCallbacks: HeartbeatCallbacks) => {
    callbacks = nextCallbacks;

    if (heartbeatInterval) {
      return;
    }

    updateDebugMetric("isHeartbeatActive", true);

    heartbeatInterval = setInterval(() => {
      const packet = { type: NETWORK.PING, timestamp: Date.now() };
      callbacks?.onPing(packet);

      Array.from(pongTrackers.entries()).forEach(([ip, tracker]) => {
        const nextMissed = tracker.missed + 1;
        tracker.missed = nextMissed;

        // ── Fast Reconnect Logic ──
        // If we've missed pings but haven't exhausted reconnect tries,
        // attempt to re-establish the TCP connection before declaring stale.
        if (
          nextMissed >= 2 &&
          !tracker.isReconnecting &&
          tracker.reconnectAttempts < NETWORK.RECONNECT_ATTEMPTS
        ) {
          tracker.isReconnecting = true;
          tracker.reconnectAttempts += 1;

          if (__DEV__) {
            console.log(
              `[Heartbeat] Fast Reconnect attempt ${tracker.reconnectAttempts}/${NETWORK.RECONNECT_ATTEMPTS} for ${ip}`,
            );
          }

          // Check if the TCP socket is still alive
          const isAlive = GameSessionTransport.isConnectedTo(ip);

          if (!isAlive) {
            // Socket is dead — this may be AP Isolation if we're still on Wi-Fi
            if (
              tracker.reconnectAttempts >= NETWORK.RECONNECT_ATTEMPTS
            ) {
              callbacks?.onApIsolation?.();
            }
          }

          tracker.isReconnecting = false;
        }

        // ── Stale Peer Declaration ──
        // Only declare stale after exhausting all reconnect attempts
        if (
          nextMissed >= 3 + NETWORK.RECONNECT_ATTEMPTS &&
          tracker.reconnectAttempts >= NETWORK.RECONNECT_ATTEMPTS
        ) {
          if (__DEV__) {
            console.log(
              `[Heartbeat] Peer ${ip} declared stale after ${nextMissed} missed pings and ${tracker.reconnectAttempts} reconnect attempts.`,
            );
          }
          callbacks?.onStale(ip);
        }
      });
    }, 3000);
  },

  addClient: (ip: string) => {
    if (!ip) {
      return;
    }
    pongTrackers.set(ip, {
      missed: 0,
      reconnectAttempts: 0,
      isReconnecting: false,
    });
  },

  removeClient: (ip: string) => {
    if (!ip) {
      return;
    }
    pongTrackers.delete(ip);
  },

  resetTracker: (ip: string) => {
    if (!ip || !pongTrackers.has(ip)) {
      return;
    }
    // Reset everything — successful pong means connection is alive
    pongTrackers.set(ip, {
      missed: 0,
      reconnectAttempts: 0,
      isReconnecting: false,
    });
  },

  stop: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    callbacks = null;
    pongTrackers.clear();
    updateDebugMetric("isHeartbeatActive", false);
  },
};
