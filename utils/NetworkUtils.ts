import { NetworkInfo } from "react-native-network-info";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NETWORK } from "@/constants/Networking";

const TAG = "[NetworkUtils]";

/**
 * Classifies an IP as likely cellular (carrier NAT).
 * 10.x.x.x  → RFC 1918 but on Android almost always means cellular rmnet interface
 * 100.64-127.x.x → RFC 6598 CGNAT (carrier-grade NAT)
 */
const isLikelyCellularIp = (ip: string): boolean => {
  if (ip.startsWith("10.")) return true;
  // 100.64.0.0/10 = CGNAT range
  if (ip.startsWith("100.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 64 && second <= 127) return true;
  }
  return false;
};

/**
 * Gets the local LAN IP address for hosting/joining.
 *
 * PERMUTATION TABLE:
 * ┌────────────────────────────────────┬──────────────────────────────────────┐
 * │ Scenario                          │ What happens                         │
 * ├────────────────────────────────────┼──────────────────────────────────────┤
 * │ WiFi connected (192.168.x.x)      │ Returns WiFi IP directly             │
 * │ Hotspot ON + data OFF             │ NetworkInfo returns null/0.0.0.0     │
 * │                                   │ → Fallback to 192.168.43.1           │
 * │ Hotspot ON + data ON              │ NetworkInfo returns 10.x (cellular)  │
 * │                                   │ → Fallback to 192.168.43.1           │
 * │ Data ON, no hotspot, no WiFi      │ Returns 10.x (can't host but can    │
 * │                                   │ try to join)                          │
 * │ Completely offline                │ Returns null                          │
 * │ iOS hotspot                       │ Fallback to 172.20.10.1              │
 * └────────────────────────────────────┴──────────────────────────────────────┘
 */
/**
 * Gets the gateway IP address (the Host/Router IP).
 * Essential for clients to find the host on a hotspot.
 */
export const getGatewayIpAddress = async (): Promise<string | null> => {
  try {
    const gateway = await NetworkInfo.getGateway();
    console.log(`${TAG} Gateway IP: ${gateway || "null"}`);
    if (gateway === "0.0.0.0" || !gateway) return null;
    return gateway;
  } catch (e) {
    console.error(`${TAG} ❌ Failed to get Gateway:`, e);
    return null;
  }
};

/**
 * Gets the local LAN IP address for hosting/joining.
 */
export const getLocalIpAddress = async (): Promise<string | null> => {
  try {
    const netState = await NetInfo.fetch();
    const netType = netState.type;
    const isConnected = netState.isConnected;

    console.log(`${TAG} NetInfo state → type=${netType}, connected=${isConnected}`);

    let ip = await NetworkInfo.getIPV4Address();
    console.log(`${TAG} Raw IP from NetworkInfo: ${ip || "null"}`);

    const isInvalidIp = !ip || ip === "0.0.0.0" || ip === "";

    // ✅ HOTSPOT DETECTION: On Android, if we are cellular but disconnected (NetInfo quirk),
    // or if we have a cellular IP (10.x), we are likely hosting a hotspot.
    if (Platform.OS === "android") {
      const isCellular = ip ? isLikelyCellularIp(ip) : false;

      // NetInfo often says 'cellular' when hotspot is active but mobile data is OFF.
      const likelyHostingHotspot = (netType === 'cellular' && !isConnected) || (netType === 'none' && !isConnected);

      if (isInvalidIp || isCellular || likelyHostingHotspot) {
        // If NetInfo explicitly says WiFi, trust the IP even if it looks like cellular
        if (netType === "wifi" && !isInvalidIp) {
          console.log(`${TAG} ⚠️ IP looks cellular but NetInfo says WiFi → trusting: ${ip}`);
          return ip;
        }

        const fallback = NETWORK.ANDROID_HOTSPOT_IP;
        console.log(
          `${TAG} 📡 Hotspot host detected. Using fallback: ${fallback}`,
          `(reason: ${isInvalidIp ? "invalid IP" : likelyHostingHotspot ? "NetInfo hotspot state" : `cellular IP ${ip}`})`,
        );
        return fallback;
      }
    }

    if (Platform.OS === "ios" && isInvalidIp) {
      const fallback = "172.20.10.1";
      console.log(`${TAG} 📡 iOS hotspot fallback: ${fallback}`);
      return fallback;
    }

    console.log(`${TAG} ✅ Final Local IP: ${ip}`);
    return ip;
  } catch (e) {
    console.error(`${TAG} ❌ Failed to get IP:`, e);
    return null;
  }
};
