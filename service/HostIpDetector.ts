/**
 * HostIpDetector — Async IP detection loop for the hosting device.
 * Extracted from lanLobbyCoordinator for Single Responsibility.
 * 
 * Runs a background loop that detects the local IP, syncs it to Redux,
 * and starts UDP broadcasting when a valid IP is found.
 */
import NetInfo from "@react-native-community/netinfo";
import store from "@/redux/store";
import { setSessionNetworkInfo, setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { getLocalIpAddress } from "@/utils/NetworkUtils";
import { LanDiscoveryService } from "./network/LanDiscoveryService";
import { LanCandidateIpService } from "./network/LanCandidateIpService";
import { logLanDebug, updateDebugMetric } from "./observability/DebugService";

/**
 * Starts the async IP detection loop. Returns the NetInfo unsubscribe function.
 */
export const startIpDetectionLoop = (opts: {
  roomCode: string;
  actualPort: number;
  hostName: string;
  lobbyId: string;
}): (() => void) | null => {
  let unsubscribeNetInfo: (() => void) | null = null;

  void (async () => {
    let lastSyncedIp: string | null = "INITIAL_UNSET";
    let attempts = 0;
    const maxFastAttempts = 8;
    const startTime = Date.now();

    console.log("[HostIpDetector] 🔍 Starting automatic IP detection loop...");

    unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(`[HostIpDetector] 📡 NetInfo changed (type=${state.type}) → triggering IP re-check`);
    });

    while (attempts < 200) {
      attempts++;
      const elapsed = Date.now() - startTime;
      const allowAutoFallback = elapsed > 4000;

      const { ip: currentIp, isFallback: currentIsFallback } = await getLocalIpAddress({
        useFallback: allowAutoFallback,
      });

      const session = store.getState().session;
      const isHardwareFoundOverFallback = currentIp && !currentIsFallback && session.isFallback;
      const isIpChanged = currentIp !== lastSyncedIp;

      if (currentIp && (isIpChanged || isHardwareFoundOverFallback)) {
        lastSyncedIp = currentIp;

        const finalRoomCode = (opts.roomCode === "000" || !opts.roomCode) 
          ? (currentIp.split(".")[3].padStart(3, "0"))
          : opts.roomCode;

        const qrPayloadObj = {
          ip: currentIp,
          port: opts.actualPort,
          roomCode: finalRoomCode,
          candidateIps: LanCandidateIpService.getCandidateIps(
            parseInt(currentIp.split(".")[3], 10),
            { localIp: currentIp, gatewayIp: null },
          ),
        };
        const qrPayload = JSON.stringify(qrPayloadObj);

        logLanDebug(`selected IP: ${currentIp} (code=${finalRoomCode}, fallback=${currentIsFallback})`);
        updateDebugMetric("hostIp", currentIp);
        updateDebugMetric("lanIsFallback", currentIsFallback);
        updateDebugMetric("lanQrPayload", qrPayload);

        console.log(`[HostIpDetector] 🔄 IP: ${currentIp} (code=${finalRoomCode}, ${elapsed}ms). Fallback: ${currentIsFallback ? "YES" : "NO"}`);

        store.dispatch(setSessionNetworkInfo({
          hostIp: currentIp,
          roomCode: finalRoomCode,
          isFallback: currentIsFallback,
        }));
        store.dispatch(setLocalSessionIdentity({ localIp: currentIp }));

        if (finalRoomCode) {
          LanDiscoveryService.startBroadcasting({
            roomCode: finalRoomCode,
            tcpPort: opts.actualPort,
            hostName: opts.hostName,
            lobbyId: opts.lobbyId,
            hostIp: currentIp,
            version: "1.0.0",
          });
        }
      }

      const delay = attempts <= maxFastAttempts ? 500 : 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (store.getState().session.connectionStatus !== "HOSTING") break;
    }
  })();

  // Return a cleanup function
  return () => {
    if (unsubscribeNetInfo) {
      unsubscribeNetInfo();
      unsubscribeNetInfo = null;
    }
  };
};
