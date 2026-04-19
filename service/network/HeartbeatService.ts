import { NETWORK } from "../../constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";

type HeartbeatCallbacks = {
  onPing: (packet: any) => void;
  onStale: (ip: string) => void;
};

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
const pongTrackers: Map<string, number> = new Map();
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

      Array.from(pongTrackers.entries()).forEach(([ip, missed]) => {
        const nextMissed = missed + 1;
        pongTrackers.set(ip, nextMissed);

        if (nextMissed >= 3) {
          callbacks?.onStale(ip);
        }
      });
    }, 3000);
  },

  addClient: (ip: string) => {
    if (!ip) {
      return;
    }
    pongTrackers.set(ip, 0);
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
    pongTrackers.set(ip, 0);
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
