import { NetworkInfo } from "react-native-network-info";
import { Platform } from "react-native";
import { NETWORK } from "@/constants/Networking";

export const getLocalIpAddress = async (): Promise<string | null> => {
  try {
    const ip = await NetworkInfo.getIPV4Address();
    
    // 🚀 HOTSPOT FALLBACK: On Android, if the device is a hotspot host, 
    // getIPV4Address() often returns null because it only checks the Wi-Fi client interface.
    // Most Android devices use 192.168.43.1 as the gateway/hotspot IP.
    if (!ip && Platform.OS === 'android') {
      return NETWORK.ANDROID_HOTSPOT_IP;
    }
    
    return ip;
  } catch (e) {
    console.warn("Failed to get IP:", e);
    return null;
  }
};
