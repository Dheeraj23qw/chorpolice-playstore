import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid, Linking } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export type PermissionStep =
  | "idle"
  | "checking_wifi"
  | "requesting_permissions"
  | "ready";

export type PermissionStatus =
  | "pending"
  | "granted"
  | "denied"
  | "no_wifi"
  | "error";

export const useNetworkPermissions = (enabled = true) => {
  const [step, setStep] = useState<PermissionStep>("idle");
  const [status, setStatus] = useState<PermissionStatus>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const runFlow = useCallback(async () => {
    if (!enabled) {
      if (!mountedRef.current) return;
      setStep("ready");
      setStatus("granted");
      setErrorMessage(null);
      return;
    }

    if (!mountedRef.current) return;

    setStep("idle");
    setStatus("pending");
    setErrorMessage(null);

    try {
      // ─── PHASE 1: WIFI VALIDATION ───
      setStep("checking_wifi");

      const netState = await NetInfo.fetch();

      const hasValidWifi =
        netState.type === "wifi" &&
        netState.isConnected &&
        netState.details?.ipAddress;

      if (!hasValidWifi) {
        if (!mountedRef.current) return;
        setStatus("no_wifi");
        setErrorMessage(
          "Please connect both devices to the same WiFi network.",
        );
        return;
      }

      // ─── PHASE 2: ANDROID PERMISSIONS ───
      if (Platform.OS === "android") {
        setStep("requesting_permissions");
        const apiLevel = Platform.Version as number;

        const LOCATION_PERM =
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

        if (apiLevel >= 33) {
          const NEARBY_PERM = "android.permission.NEARBY_WIFI_DEVICES";

          const hasNearby = await PermissionsAndroid.check(NEARBY_PERM as any);
          const hasLocation = await PermissionsAndroid.check(LOCATION_PERM);

          if (!hasNearby || !hasLocation) {
            const results = await PermissionsAndroid.requestMultiple([
              NEARBY_PERM as any,
              LOCATION_PERM,
            ]);

            const isNearbyGranted =
              results[NEARBY_PERM] === PermissionsAndroid.RESULTS.GRANTED;
            const isLocationGranted =
              results[LOCATION_PERM] === PermissionsAndroid.RESULTS.GRANTED;

            if (!isNearbyGranted || !isLocationGranted) {
              if (!mountedRef.current) return;

              setStatus("denied");

              // Handle "never ask again"
              if (
                results[NEARBY_PERM] ===
                  PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                results[LOCATION_PERM] ===
                  PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
              ) {
                setErrorMessage(
                  "Permission permanently denied. Please enable it from settings.",
                );
              } else {
                setErrorMessage(
                  "Permissions are required to find and connect to players.",
                );
              }

              return;
            }
          }
        } else {
          // Android 12 and below
          const hasLocation = await PermissionsAndroid.check(LOCATION_PERM);

          if (!hasLocation) {
            const result = await PermissionsAndroid.request(LOCATION_PERM);

            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
              if (!mountedRef.current) return;

              setStatus("denied");

              if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                setErrorMessage(
                  "Permission permanently denied. Please enable it from settings.",
                );
              } else {
                setErrorMessage(
                  "Location permission is required for LAN multiplayer.",
                );
              }

              return;
            }
          }
        }
      }

      // ─── PHASE 3: READY ───
      if (!mountedRef.current) return;

      setStep("ready");
      setStatus("granted");
    } catch (error) {
      console.error("Handshake Error:", error);

      if (!mountedRef.current) return;

      setStatus("error");
      setErrorMessage("Something went wrong. Please retry.");
    }
  }, [enabled]);

  // ─── INIT + CLEANUP ───
  useEffect(() => {
    mountedRef.current = true;
    void runFlow();

    return () => {
      mountedRef.current = false;
    };
  }, [runFlow]);

  // ─── REAL-TIME WIFI MONITOR ───
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (
        state.type !== "wifi" ||
        !state.isConnected ||
        !state.details?.ipAddress
      ) {
        if (mountedRef.current) {
          setStatus("no_wifi");
          setErrorMessage(
            "WiFi connection lost. Please reconnect to continue.",
          );
        }
      }
    });

    return unsubscribe;
  }, [enabled]);

  return {
    step,
    status,
    retry: runFlow,
    errorMessage,
    openSettings: () => Linking.openSettings(),
  };
};
