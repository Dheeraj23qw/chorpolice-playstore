import { NetworkInfo } from "react-native-network-info";

export const getLocalIpAddress = async (): Promise<string | null> => {
  try {
    const ip = await NetworkInfo.getIPV4Address();
    return ip;
  } catch (e) {
    console.warn("Failed to get IP:", e);
    return null;
  }
};
