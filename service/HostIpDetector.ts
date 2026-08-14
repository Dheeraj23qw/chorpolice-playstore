/**
 * HostIpDetector — Simplified IP detection for host.
 */
import store from "@/redux/store";
import { setSessionNetworkInfo, setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { logLanDebug, updateDebugMetric } from "./observability/DebugService";

export const startIpDetectionLoop = (opts: {
  roomCode: string;
  actualPort: number;
  hostName: string;
  lobbyId: string;
}): (() => void) | null => {
  void (async () => {
    let attempts = 0;
    const maxAttempts = 30;
    const startTime = Date.now();

    console.log("[HostIpDetector] Starting IP detection loop...");

    while (attempts < maxAttempts) {
      attempts++;
      const elapsed = Date.now() - startTime;
      const allowAutoFallback = elapsed > 4000;

      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        const currentIp = data.ip;

        if (currentIp) {
          const finalRoomCode = (opts.roomCode === "000" || !opts.roomCode)
            ? (currentIp.split(".")[3].padStart(3, "0"))
            : opts.roomCode;

          logLanDebug(`selected IP: ${currentIp} (code=${finalRoomCode})`);
          updateDebugMetric("hostIp", currentIp);

          console.log(`[HostIpDetector] IP: ${currentIp} (code=${finalRoomCode}, ${elapsed}ms)`);

          store.dispatch(setSessionNetworkInfo({
            hostIp: currentIp,
            roomCode: finalRoomCode,
          }));
          store.dispatch(setLocalSessionIdentity({ localIp: currentIp }));
        }
      } catch (e) {
        console.warn("[HostIpDetector] IP detection failed:", e);
      }

      const delay = attempts <= 10 ? 500 : 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (store.getState().session.connectionStatus !== "HOSTING") break;
    }
  })();

  return null;
};
