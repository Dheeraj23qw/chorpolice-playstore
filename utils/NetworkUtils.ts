import { NetworkInfo } from "react-native-network-info";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NETWORK } from "@/constants/Networking";
import { logLanDebug, updateDebugMetric } from "@/service/observability/DebugService";

const TAG = "[NetworkUtils]";

/**
 * Classifies an IP as likely cellular (carrier NAT).
 */
const isLikelyCellularIp = (ip: string): boolean => {
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("100.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 64 && second <= 127) return true;
  }
  return false;
};

/**
 * Gets the gateway IP address (the Host/Router IP).
 */
export const getGatewayIpAddress = async (): Promise<string | null> => {
  try {
    const gateway = await NetworkInfo.getGatewayIPAddress();
    console.log(`${TAG} 🔍 Gateway IP: ${gateway || "null"}`);
    if (gateway === "0.0.0.0" || !gateway || gateway === "127.0.0.1") return null;
    return gateway;
  } catch (e) {
    console.error(`${TAG} ❌ Failed to get Gateway:`, e);
    return null;
  }
};

/**
 * Advanced Android-specific IP discovery.
 * Tries to find the most likely interface for a Hotspot or LAN room.
 */
export const getLocalIpAddress = async (options: { useFallback?: boolean } = {}): Promise<{ ip: string | null; isFallback: boolean }> => {
  try {
    const netState = await NetInfo.fetch();
    console.log(`${TAG} 📡 NetInfo state: type=${netState.type}, connected=${netState.isConnected}`);

    // 1️⃣ Try standard IP detection first
    let ip = await NetworkInfo.getIPV4Address();
    console.log(`${TAG} ℹ️ Raw IP from OS: ${ip || "null"}`);
    
    const candidates: string[] = [];
    if (ip && ip !== "0.0.0.0" && ip !== "127.0.0.1") candidates.push(ip);

    if (Platform.OS === "android") {
      // 2️⃣ Scan all interfaces for hotspot/LAN candidates (if available in this version)
      const isCellular = ip ? isLikelyCellularIp(ip) : false;
      const isInvalid = !ip || ip === "0.0.0.0" || ip === "127.0.0.1";

      // 3️⃣ Try to detect Hotspot IP via Gateway
      const gateway = await NetworkInfo.getGatewayIPAddress();
      if (gateway && gateway !== "0.0.0.0" && gateway !== "127.0.0.1" && !isLikelyCellularIp(gateway)) {
        if (!candidates.includes(gateway)) candidates.push(gateway);
      }

      logLanDebug(`IP candidates: ${candidates.join(", ")}`);
      updateDebugMetric("lanCandidates", candidates);

      // If we have a valid WiFi IP, return it immediately
      // PROD-FIX: Even if it's 10.*, if we are on WiFi, it's a valid local IP (common on campus/office networks)
      if (netState.type === "wifi" && !isInvalid) {
        console.log(`${TAG} ✅ Valid WiFi IP found: ${ip}`);
        updateDebugMetric("lanIsFallback", false);
        return { ip: ip!, isFallback: false };
      }

      // If we have any valid candidates, prefer them
      if (candidates.length > 0) {
        console.log(`${TAG} ✅ Using candidate IP: ${candidates[0]}`);
        updateDebugMetric("lanIsFallback", false);
        return { ip: candidates[0], isFallback: false };
      }

      // 4️⃣ Fallback logic ONLY if no real candidates were found
      if (options.useFallback || isInvalid || isCellular || netState.type === "none" || netState.type === "unknown") {
        const fallbacks = ["192.168.43.1", "192.168.49.1", "172.20.10.1"];
        
        if (options.useFallback) {
          logLanDebug(`No candidates found, using fallback: ${fallbacks[0]}`);
          updateDebugMetric("lanIsFallback", true);
          return { ip: fallbacks[0], isFallback: true };
        }

        if (isCellular) {
          logLanDebug(`Cellular detected (no candidates), forcing fallback: ${fallbacks[0]}`);
          updateDebugMetric("lanIsFallback", true);
          return { ip: fallbacks[0], isFallback: true };
        }
      }
    }

    if (Platform.OS === "ios" && (!ip || ip === "127.0.0.1")) {
      return { ip: "172.20.10.1", isFallback: true };
    }

    const finalIp = ip && ip !== "127.0.0.1" ? ip : null;
    return { ip: finalIp, isFallback: false };
  } catch (e) {
    console.error(`${TAG} ❌ IP Discovery Error:`, e);
    return { ip: null, isFallback: false };
  }
};

