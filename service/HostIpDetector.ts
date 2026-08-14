import NetInfo from "@react-native-community/netinfo";
import TcpSocket from "react-native-tcp-socket";
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

const normalizeIp = (ip: string | null | undefined): string | null => {
  if (!ip) return null;
  return ip.replace(/^::ffff:/, "");
};

const probeLocalAddressViaTcp = async (
  timeoutMs = 1500
): Promise<string | null> => {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (ip: string | null) => {
      if (settled) return;
      settled = true;
      resolve(ip);
    };

    try {
      const socket = TcpSocket.createConnection(
        { port: 53, host: "8.8.8.8" },
        () => {
          const localAddress = normalizeIp(socket.localAddress);
          finish(localAddress);
          try {
            socket.destroy();
          } catch {}
        }
      );

      socket.on("error", () => {
        finish(null);
        try {
          socket.destroy();
        } catch {}
      });

      socket.on("close", () => {
        if (!settled) finish(null);
      });

      setTimeout(() => {
        if (!settled) {
          const localAddress = normalizeIp(socket.localAddress);
          finish(localAddress);
          try {
            socket.destroy();
          } catch {}
        }
      }, timeoutMs);
    } catch {
      finish(null);
    }
  });
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

export const startIpDetectionLoop = (opts: {
  roomCode: string;
  actualPort: number;
  hostName: string;
  lobbyId: string;
}): (() => void) | null => {
  void (async () => {
    let attempts = 0;
    const maxAttempts = 10;
    const startTime = Date.now();

    console.log("[HostIpDetector] Starting local IP detection loop...");

    while (attempts < maxAttempts) {
      attempts++;
      const elapsed = Date.now() - startTime;

      try {
        let detectedIp: string | null = null;

        detectedIp = await tryNetInfoIp();

        if (!detectedIp) {
          detectedIp = await tryHotspotInterfaces();
        }

        if (!detectedIp) {
          detectedIp = await probeLocalAddressViaTcp();
        }

        if (detectedIp) {
          const finalRoomCode =
            opts.roomCode === "000" || !opts.roomCode
              ? detectedIp.split(".")[3].padStart(3, "0")
              : opts.roomCode;

          logLanDebug(`selected IP: ${detectedIp} (code=${finalRoomCode})`);
          updateDebugMetric("hostIp", detectedIp);

          console.log(
            `[HostIpDetector] IP: ${detectedIp} (code=${finalRoomCode}, ${elapsed}ms)`
          );

          store.dispatch(
            setSessionNetworkInfo({
              hostIp: detectedIp,
              roomCode: finalRoomCode,
              isFallback: false,
            })
          );
          store.dispatch(
            setLocalSessionIdentity({ localIp: detectedIp })
          );
          return;
        }

        logLanDebug(`No local IP found on attempt ${attempts}`);
      } catch (e) {
        console.warn("[HostIpDetector] IP detection failed:", e);
      }

      const delay = attempts <= 5 ? 500 : 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (store.getState().session.connectionStatus !== "HOSTING") break;
    }

    if (store.getState().session.connectionStatus === "HOSTING") {
      console.warn(
        "[HostIpDetector] Failed to detect local IP after all attempts"
      );
      store.dispatch(
        setSessionError(
          "Could not detect local network IP. Ensure Wi-Fi or hotspot is ON."
        )
      );
    }
  })();

  return null;
};
