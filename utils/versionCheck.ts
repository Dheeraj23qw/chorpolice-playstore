import Constants from "expo-constants";

// The Raw URL you provided
const UPDATE_CONFIG_URL =
  "https://gist.githubusercontent.com/Dheeraj23qw/895f8ccc58542c3c997ca6ca299b819e/raw/851276d1a51d80ecdcdd189e140259c8f2887fd2/version.json";

export const checkAppUpdate = async (): Promise<{
  isAvailable: boolean;
  latestVersion: string;
  updateUrl: string;
}> => {
  try {
    // Append a timestamp to prevent the app from caching an old version.json
    const response = await fetch(`${UPDATE_CONFIG_URL}?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch version info");

    const data = await response.json();

    // Get the current version from your app.json config
    const currentVersion = Constants.nativeApplicationVersion || "4.2.0";
    const latestVersion = data.latestVersion;
    const updateUrl = data.updateUrl;

    const isAvailable = compareVersions(currentVersion, latestVersion) < 0;

    return {
      isAvailable,
      latestVersion,
      updateUrl,
    };
  } catch (error) {
    console.error("Error checking for app update:", error);
    // Fallback: assume no update is available if the network request fails
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
