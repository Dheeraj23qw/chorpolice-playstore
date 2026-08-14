import NetInfo from "@react-native-community/netinfo";
import store from "@/redux/store";
import {
  setSessionError,
  setSessionNetworkInfo,
  setLocalSessionIdentity,
} from "@/redux/reducers/sessionSlice";
import { logLanDebug, updateDebugMetric } from "./observability/DebugService";

const PRIVATE_RANGES: [number, number, number, number][][] = [
  [
    [10, 0, 0, 0],
    [10, 255, 255, 255],
  ],
  [
    [172, 16, 0, 0],
    [172, 31, 255, 255],
  ],
  [
    [192, 168, 0, 0],
    [192, 168, 255, 255],
  ],
];

const isPrivateIPv4 = (ip: string): boolean => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  return PRIVATE_RANGES.some(([start, end]) =>
    parts.every((p, i) => p >= start[i] && p <= end[i])
  );
};

const isValidLocalIPv4 = (ip: string): boolean => {
  if (!ip) return false;
  const normalized = ip.replace(/^::ffff:/, "");
  if (normalized === "0.0.0.0" || normalized === "127.0.0.1") return false;
  return isPrivateIPv4(normalized);
};

const tryHotspotInterfaces = async (): Promise<string | null> => {
  const candidates = ["ap0", "wlan0", "wlan1", "wifi"];
  for (const iface of candidates) {
    try {
      const state = await NetInfo.fetch(iface);
      const details = state.details as { ipAddress?: string | null } | null;
      const raw = details?.ipAddress;
      if (raw && isValidLocalIPv4(raw)) {
        return raw;
      }
    } catch {
      // interface not available, continue
    }
  }
  return null;
};

const tryNetInfoIp = async (): Promise<string | null> => {
  try {
    const state = await NetInfo.fetch();
    if (state.type === "wifi" || state.type === "ethernet") {
      const details = state.details as { ipAddress?: string | null } | null;
      const raw = details?.ipAddress;
      if (raw && isValidLocalIPv4(raw)) {
        return raw;
      }
    }
  } catch (e) {
    console.warn("[HostIpDetector] NetInfo fetch failed:", e);
  }
  return null;
};

// ── IP Detection / Monitoring State ──
let isIpDetectionActive = false;
let currentDetectionTimer: ReturnType<typeof setTimeout> | null = null;
let activeLoopInstanceId = 0;

export const stopIpDetectionLoop = () => {
  isIpDetectionActive = false;
  activeLoopInstanceId++;
  if (currentDetectionTimer) {
    clearTimeout(currentDetectionTimer);
    currentDetectionTimer = null;
  }
  console.log("[HostIpDetector] Stopped IP detection loop.");
};

export const startIpDetectionLoop = (opts: {
  roomCode: string;
  actualPort: number;
  hostName: string;
  lobbyId: string;
}): (() => void) => {
  // Ensure any previous loop is cancelled before starting a new one
  stopIpDetectionLoop();

  isIpDetectionActive = true;
  const thisInstanceId = ++activeLoopInstanceId;
  let attemptsWithoutIp = 0;
  const startTime = Date.now();

  console.log("[HostIpDetector] Starting local IP monitoring loop...");

  const runDetectionStep = async () => {
    // Stop if loop was cancelled or host is no longer hosting
    if (
      !isIpDetectionActive ||
      thisInstanceId !== activeLoopInstanceId ||
      store.getState().session.connectionStatus !== "HOSTING"
    ) {
      isIpDetectionActive = false;
      return;
    }

    try {
      // 1. Explicit hotspot/local interfaces first
      let detectedIp: string | null = await tryHotspotInterfaces();

      // 2. Normal NetInfo connected interface (Wi-Fi / Ethernet) second
      if (!detectedIp) {
        detectedIp = await tryNetInfoIp();
      }

      if (
        !isIpDetectionActive ||
        thisInstanceId !== activeLoopInstanceId ||
        store.getState().session.connectionStatus !== "HOSTING"
      ) {
        return;
      }

      if (detectedIp && isValidLocalIPv4(detectedIp)) {
        attemptsWithoutIp = 0;
        const currentHostIp = store.getState().session.hostIp;

        if (detectedIp !== currentHostIp) {
          const finalRoomCode =
            opts.roomCode === "000" || !opts.roomCode
              ? detectedIp.split(".")[3].padStart(3, "0")
              : opts.roomCode;

          const elapsed = Date.now() - startTime;
          logLanDebug(`selected IP: ${detectedIp} (code=${finalRoomCode})`);
          updateDebugMetric("hostIp", detectedIp);
          console.log(
            `[HostIpDetector] Host IP updated: ${detectedIp} (code=${finalRoomCode}, ${elapsed}ms)`
          );

          store.dispatch(
            setSessionNetworkInfo({
              hostIp: detectedIp,
              roomCode: finalRoomCode,
              isFallback: false,
            })
          );
          store.dispatch(setLocalSessionIdentity({ localIp: detectedIp }));
        }
      } else {
        // No valid private LAN IP detected in this tick
        attemptsWithoutIp++;
        const currentHostIp = store.getState().session.hostIp;

        // If network has been unavailable and we never got a valid IP yet, report error after 10 attempts
        if (attemptsWithoutIp === 10 && !currentHostIp) {
          console.warn(
            "[HostIpDetector] Failed to detect local IP after initial attempts"
          );
          store.dispatch(
            setSessionError(
              "Could not detect local network IP. Ensure Wi-Fi or hotspot is ON."
            )
          );
        }
      }
    } catch (e) {
      console.warn("[HostIpDetector] IP detection step error:", e);
    }

    // Schedule next tick
    if (
      isIpDetectionActive &&
      thisInstanceId === activeLoopInstanceId &&
      store.getState().session.connectionStatus === "HOSTING"
    ) {
      // Poll faster (1000ms) until initial IP is found, then 5000ms (5s) for lightweight monitoring
      const hasIp = !!store.getState().session.hostIp;
      const delay = hasIp ? 5000 : 1000;
      currentDetectionTimer = setTimeout(runDetectionStep, delay);
    }
  };

  // Run the first step immediately
  void runDetectionStep();

  return stopIpDetectionLoop;
};

