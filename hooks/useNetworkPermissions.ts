import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid, Linking } from "react-native";
import NetInfo from "@react-native-community/netinfo";

import {
  errorPermissionDebug,
  logPermissionDebug,
  warnPermissionDebug,
} from "@/utils/permissionDebug";

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

type UseNetworkPermissionsOptions = {
  enabled?: boolean;
  requireWifiIpAddress?: boolean;
  requireAndroidWifiPermissions?: boolean;
};

export const useNetworkPermissions = (
  enabledOrOptions: boolean | UseNetworkPermissionsOptions = true,
) => {
  const {
    enabled,
    requireWifiIpAddress,
    requireAndroidWifiPermissions,
  } =
    typeof enabledOrOptions === "boolean"
      ? {
          enabled: enabledOrOptions,
          requireWifiIpAddress: true,
          requireAndroidWifiPermissions: true,
        }
      : {
          enabled: enabledOrOptions.enabled ?? true,
          requireWifiIpAddress:
            enabledOrOptions.requireWifiIpAddress ?? true,
          requireAndroidWifiPermissions:
            enabledOrOptions.requireAndroidWifiPermissions ?? true,
        };
  const [step, setStep] = useState<PermissionStep>("idle");
  const [status, setStatus] = useState<PermissionStatus>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const runFlow = useCallback(async () => {
    logPermissionDebug("NetworkPermissions", "Starting permission flow", {
      enabled,
      requireWifiIpAddress,
      requireAndroidWifiPermissions,
      platform: Platform.OS,
      platformVersion: Platform.Version,
    });

    if (!enabled) {
      if (!mountedRef.current) return;
      setStep("ready");
      setStatus("granted");
      setErrorMessage(null);
      logPermissionDebug(
        "NetworkPermissions",
        "Permissions bypassed because the flow is disabled",
      );
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
      logPermissionDebug("NetworkPermissions", "NetInfo.fetch() result", {
        type: netState.type,
        isConnected: netState.isConnected,
        isInternetReachable: netState.isInternetReachable,
        details: netState.details,
      });

      const hasWifiConnection = netState.type === "wifi" && netState.isConnected;
      const hasValidWifi =
        hasWifiConnection &&
        (!requireWifiIpAddress || Boolean(netState.details?.ipAddress));

      if (!hasValidWifi) {
        if (!mountedRef.current) return;
        setStatus("no_wifi");
        setErrorMessage(
          requireWifiIpAddress
            ? "Please connect both devices to the same WiFi network."
            : "Please connect both devices to the same WiFi or hotspot.",
        );
        warnPermissionDebug("NetworkPermissions", "Wi-Fi validation failed", {
          hasWifiConnection,
          hasValidWifi,
          requireWifiIpAddress,
          details: netState.details,
        });
        return;
      }

      // ─── PHASE 2: ANDROID PERMISSIONS ───
      if (Platform.OS === "android" && requireAndroidWifiPermissions) {
        setStep("requesting_permissions");
        const apiLevel = Platform.Version as number;

        const LOCATION_PERM =
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

        if (apiLevel >= 33) {
          const NEARBY_PERM = "android.permission.NEARBY_WIFI_DEVICES";

          const hasNearby = await PermissionsAndroid.check(NEARBY_PERM as any);
          const hasLocation = await PermissionsAndroid.check(LOCATION_PERM);
          logPermissionDebug(
            "NetworkPermissions",
            "Existing Android permission check",
            {
              apiLevel,
              hasNearby,
              hasLocation,
              requestedPermissions: [NEARBY_PERM, LOCATION_PERM],
            },
          );

          if (!hasNearby || !hasLocation) {
            const results = await PermissionsAndroid.requestMultiple([
              NEARBY_PERM as any,
              LOCATION_PERM,
            ]);
            logPermissionDebug(
              "NetworkPermissions",
              "Android requestMultiple result",
              results,
            );

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

              warnPermissionDebug(
                "NetworkPermissions",
                "Android permission request denied",
                {
                  apiLevel,
                  results,
                },
              );

              return;
            }
          }
        } else {
          // Android 12 and below
          const hasLocation = await PermissionsAndroid.check(LOCATION_PERM);
          logPermissionDebug(
            "NetworkPermissions",
            "Existing Android location permission check",
            {
              apiLevel,
              hasLocation,
              requestedPermission: LOCATION_PERM,
            },
          );

          if (!hasLocation) {
            const result = await PermissionsAndroid.request(LOCATION_PERM);
            logPermissionDebug("NetworkPermissions", "Android request result", {
              permission: LOCATION_PERM,
              result,
            });

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

              warnPermissionDebug(
                "NetworkPermissions",
                "Android location permission denied",
                {
                  apiLevel,
                  permission: LOCATION_PERM,
                  result,
                },
              );

              return;
            }
          }
        }
      }

      // ─── PHASE 3: READY ───
      if (!mountedRef.current) return;

      setStep("ready");
      setStatus("granted");
      logPermissionDebug(
        "NetworkPermissions",
        "Permission flow completed successfully",
      );
    } catch (error) {
      errorPermissionDebug("NetworkPermissions", "Permission flow crashed", error);
      console.error("Handshake Error:", error);

      if (!mountedRef.current) return;

      setStatus("error");
      setErrorMessage("Something went wrong. Please retry.");
    }
  }, [enabled, requireAndroidWifiPermissions, requireWifiIpAddress]);

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
      logPermissionDebug("NetworkPermissions", "NetInfo listener update", {
        type: state.type,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });

      const hasWifiConnection = state.type === "wifi" && state.isConnected;
      const hasValidWifi =
        hasWifiConnection &&
        (!requireWifiIpAddress || Boolean(state.details?.ipAddress));

      if (!hasValidWifi) {
        if (mountedRef.current) {
          setStatus("no_wifi");
          setErrorMessage(
            requireWifiIpAddress
              ? "WiFi connection lost. Please reconnect to continue."
              : "WiFi or hotspot connection lost. Please reconnect to continue.",
          );
          warnPermissionDebug(
            "NetworkPermissions",
            "NetInfo listener marked connection invalid",
            {
              hasWifiConnection,
              hasValidWifi,
              requireWifiIpAddress,
              details: state.details,
            },
          );
        }
      }
    });

    return unsubscribe;
  }, [enabled, requireWifiIpAddress]);

  return {
    step,
    status,
    retry: runFlow,
    errorMessage,
    openSettings: () => {
      logPermissionDebug("NetworkPermissions", "Opening app settings");
      return Linking.openSettings();
    },
  };
};
