import Constants from "expo-constants";
import { isValidSemver, normalizeSemver } from "@/utils/semver";

const UPDATE_CONFIG_URL =
  "https://gist.githubusercontent.com/Dheeraj23qw/895f8ccc58542c3c997ca6ca299b819e/raw/version.json";

const ALLOWED_UPDATE_DOMAINS = [
  "play.google.com",
  "apps.apple.com",
  "expo.dev",
];

function isValidHttpsUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return false;
    return ALLOWED_UPDATE_DOMAINS.some((domain) =>
      url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

interface RawRemoteVersionConfig {
  latestVersion?: unknown;
  updateUrl?: unknown;
  isMandatory?: unknown;
}

export interface RemoteVersionConfig {
  latestVersion: string;
  updateUrl: string;
  isMandatory: boolean;
}

export function validateRemoteVersionConfig(
  data: unknown,
): RemoteVersionConfig | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as RawRemoteVersionConfig;

  const latestVersion = typeof raw.latestVersion === "string"
    ? normalizeSemver(raw.latestVersion)
    : "";

  if (!latestVersion || !isValidSemver(latestVersion)) {
    console.warn("[VersionCheck] Invalid latestVersion in remote config");
    return null;
  }

  if (!isValidHttpsUrl(raw.updateUrl)) {
    console.warn("[VersionCheck] Invalid updateUrl in remote config");
    return null;
  }

  const updateUrl = String(raw.updateUrl).trim();

  const isMandatory =
    typeof raw.isMandatory === "boolean" ? raw.isMandatory : false;

  return {
    latestVersion,
    updateUrl,
    isMandatory,
  };
}

export async function checkAppUpdate(): Promise<{
  isAvailable: boolean;
  latestVersion: string;
  updateUrl: string;
  isMandatory: boolean;
}> {
  try {
    const response = await fetch(
      `${UPDATE_CONFIG_URL}?t=${Date.now()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error("Failed to fetch version info");

    const data = await response.json();
    const config = validateRemoteVersionConfig(data);

    if (!config) {
      console.warn("[VersionCheck] Remote config invalid");
      return {
        isAvailable: false,
        latestVersion: "1.0.0",
        updateUrl: "",
        isMandatory: false,
      };
    }

    const currentVersion = Constants.expoConfig?.version || "7.0.0";
    const normalizedCurrent = normalizeSemver(currentVersion);

    return {
      isAvailable: normalizedCurrent !== config.latestVersion,
      latestVersion: config.latestVersion,
      updateUrl: config.updateUrl,
      isMandatory: config.isMandatory,
    };
  } catch (error) {
    console.error("[VersionCheck] Update check failed:", error);
    return {
      isAvailable: false,
      latestVersion: "1.0.0",
      updateUrl: "",
      isMandatory: false,
    };
  }
}
