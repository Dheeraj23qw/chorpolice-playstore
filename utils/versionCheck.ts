import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Utility to check if a new version is available.
 * In a real-world scenario, you would fetch this from your backend or a remote config.
 */
export const checkAppUpdate = async (): Promise<{
  isAvailable: boolean;
  latestVersion: string;
  updateUrl: string;
}> => {
  try {
    // Current app version from expo config
    const currentVersion = Constants.expoConfig?.version || "1.0.0";

    const latestVersion = "4.0.0";

    const isAvailable = compareVersions(currentVersion, latestVersion) < 0;

    const androidPackageName =
      Constants.expoConfig?.android?.package || "com.dheeraj.chorpolice";
    const updateUrl = `https://play.google.com/store/apps/details?id=${androidPackageName}`;

    return {
      isAvailable,
      latestVersion,
      updateUrl,
    };
  } catch (error) {
    console.error("Error checking for app update:", error);
    return { isAvailable: false, latestVersion: "1.0.0", updateUrl: "" };
  }
};

/**
 * Compares two version strings (e.g., "1.2.3" and "1.2.4").
 * Returns -1 if v1 < v2, 1 if v1 > v2, 0 if v1 == v2.
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  return 0;
}
