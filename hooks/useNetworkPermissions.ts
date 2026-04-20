import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { updateDebugMetric } from "@/service/observability/DebugService";

export type PermissionStep =
  | "idle"
  | "checking_wifi"
  | "requesting_permissions"
  | "acquiring_multicast"
  | "ready";

export type PermissionStatus =
  | "pending"
  | "granted"
  | "denied"
  | "no_wifi"
  | "error";

export interface NetworkPermissionState {
  step: PermissionStep;
  status: PermissionStatus;
  wifiConnected: boolean;
  wifiSSID: string | null;
  errorMessage: string | null;
  retry: () => void;
}

/**
 * useNetworkPermissions
 *
 * Manages the full permission acquisition flow for LAN multiplayer:
 *   Step 1: Check Wi-Fi via NetInfo
 *   Step 2: Request NEARBY_WIFI_DEVICES (Android 13+) or ACCESS_FINE_LOCATION (older)
 *   Step 3: Ready for Zeroconf discovery
 *
 * Returns reactive state that drives the HandshakeStatus UI.
 */
export const useNetworkPermissions = (): NetworkPermissionState => {
  const [step, setStep] = useState<PermissionStep>("idle");
  const [status, setStatus] = useState<PermissionStatus>("pending");
  const [wifiConnected, setWifiConnected] = useState(false);
  const [wifiSSID, setWifiSSID] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const runFlow = useCallback(async () => {
    if (!mountedRef.current) return;

    setStep("idle");
    setStatus("pending");
    setErrorMessage(null);

    try {
      // ── Step 1: Check Wi-Fi ──
      setStep("checking_wifi");
      updateDebugMetric("lastPacketType", "PERM_WIFI_CHECK");

      const netState = await NetInfo.fetch();

      if (!mountedRef.current) return;

      const isWifi =
        netState.type === "wifi" && netState.isConnected === true;
      setWifiConnected(isWifi);

      // Try to read the SSID (requires location perm on older Android, may be null)
      const ssid =
        (netState.details as any)?.ssid ?? null;
      setWifiSSID(ssid);

      if (!isWifi) {
        setStatus("no_wifi");
        setErrorMessage(
          "You are not connected to Wi-Fi. Please connect to a Wi-Fi network to play multiplayer.",
        );
        return;
      }

      // ── Step 2: Request Permissions ──
      if (Platform.OS === "android") {
        setStep("requesting_permissions");
        updateDebugMetric("lastPacketType", "PERM_REQUESTING");

        const apiLevel = Platform.Version;
        let granted = false;

        if (apiLevel >= 33) {
          // Android 13+ — request NEARBY_WIFI_DEVICES (no location needed for mDNS)
          const result = await PermissionsAndroid.request(
            "android.permission.NEARBY_WIFI_DEVICES" as any,
            {
              title: "Find Nearby Players",
              message:
                "Chor Police needs permission to discover other players on your Wi-Fi network. This does NOT track your location.",
              buttonPositive: "Allow",
              buttonNegative: "Deny",
            },
          );

          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // Android 12 and below — need ACCESS_FINE_LOCATION for mDNS
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Find Nearby Players",
              message:
                "To discover other players on your network, Chor Police needs location access. This is only used for Wi-Fi discovery.",
              buttonPositive: "Allow",
              buttonNegative: "Deny",
            },
          );

          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (!mountedRef.current) return;

        if (!granted) {
          setStatus("denied");
          setErrorMessage(
            "Permission denied. You can grant it from Settings → App Permissions.",
          );
          return;
        }
      }

      // ── Step 3: All checks passed ──
      setStep("acquiring_multicast");
      updateDebugMetric("lastPacketType", "PERM_MULTICAST_LOCK");

      // Small delay to visually show the multicast step
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (!mountedRef.current) return;

      setStep("ready");
      setStatus("granted");
      updateDebugMetric("lastPacketType", "PERM_GRANTED");
    } catch (error) {
      if (!mountedRef.current) return;

      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while setting up permissions.",
      );

      if (__DEV__) {
        console.error("[Permissions] Flow failed:", error);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void runFlow();

    return () => {
      mountedRef.current = false;
    };
  }, [runFlow]);

  return {
    step,
    status,
    wifiConnected,
    wifiSSID,
    errorMessage,
    retry: runFlow,
  };
};
