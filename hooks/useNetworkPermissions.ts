import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid, Linking, AppState, AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";

import {
  errorPermissionDebug,
  logPermissionDebug,
  warnPermissionDebug,
} from "@/utils/permissionDebug";

type PermissionStep =
  | "idle"
  | "checking_wifi"
  | "requesting_permissions"
  | "ready";

type PermissionStatus =
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

let sharedAndroidPermissionRequestPromise: Promise<unknown> | null = null;

const runSharedAndroidPermissionRequest = async <T,>(
  payload: unknown,
  request: () => Promise<T>,
) => {
  if (sharedAndroidPermissionRequestPromise) {
    logPermissionDebug(
      "NetworkPermissions",
      "Reusing shared Android permission request",
      payload,
    );
    return (await sharedAndroidPermissionRequestPromise) as T;
  }

  const requestPromise = request();
  sharedAndroidPermissionRequestPromise = requestPromise;

  try {
    return await requestPromise;
  } finally {
    if (sharedAndroidPermissionRequestPromise === requestPromise) {
      sharedAndroidPermissionRequestPromise = null;
    }
  }
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
  const activeRunIdRef = useRef(0);
  const inFlightRunRef = useRef<Promise<void> | null>(null);

  const runFlow = useCallback(async (silent = false) => {
    if (inFlightRunRef.current) {
      logPermissionDebug(
        "NetworkPermissions",
        "Reusing in-flight permission flow",
        { activeRunId: activeRunIdRef.current },
      );
      await inFlightRunRef.current;
      return;
    }

    const runId = activeRunIdRef.current + 1;
    activeRunIdRef.current = runId;

    const isActiveRun = () =>
      mountedRef.current && activeRunIdRef.current === runId;

    const flowPromise = (async () => {
      logPermissionDebug("NetworkPermissions", "Starting permission flow", {
        runId,
        enabled,
        requireWifiIpAddress,
        requireAndroidWifiPermissions,
        platform: Platform.OS,
        platformVersion: Platform.Version,
      });

      if (!enabled) {
        if (!isActiveRun()) return;
        setStep("ready");
        setStatus("granted");
        setErrorMessage(null);
        logPermissionDebug(
          "NetworkPermissions",
          "Permissions bypassed because the flow is disabled",
          { runId },
        );
        return;
      }

      if (!isActiveRun()) {
        return;
      }

      if (!silent) {
        setStep("idle");
        setStatus("pending");
        setErrorMessage(null);
      }

      try {
        setStep("checking_wifi");

        const netState = await NetInfo.fetch();
        logPermissionDebug("NetworkPermissions", "NetInfo.fetch() result", {
          runId,
          type: netState.type,
          isConnected: netState.isConnected,
          isInternetReachable: netState.isInternetReachable,
          details: netState.details,
        });

        // 🚀 PROD-READY: WiFi detection can be tricky with Hotspots. 
        // If type is 'wifi' it's obvious. If not, we check if we actually have a local IP.
        const isWifi = netState.type === "wifi" || netState.type === "ethernet";
        const isCellular = netState.type === "cellular";
        const hasLocalIp = Boolean(netState.details && "ipAddress" in netState.details && netState.details.ipAddress);
        
        // 🚀 HOTSPOT FIX: On Android, if a device is hosting a hotspot, NetInfo reports 'cellular'.
        // We ensure the device is connected AND either has a local IP (standard) or is an Android hotspot (cellular fallback).
        const hasValidConnection = netState.isConnected && (isWifi || hasLocalIp || (Platform.OS === 'android' && isCellular));

        if (!hasValidConnection) {
          if (!isActiveRun()) return;
          setStatus("no_wifi");
          setErrorMessage(
            "Please connect to a WiFi network or enable your Mobile Hotspot."
          );
          warnPermissionDebug(
            "NetworkPermissions",
            "Network validation failed",
            {
              runId,
              type: netState.type,
              hasWifiConnection,
              hasLocalIp,
              requireWifiIpAddress,
            },
          );
          return;
        }

        // 🚀 PROD-READY: On Android, even with permissions, WiFi scanning fails if Location Services (GPS) is OFF.
        if (Platform.OS === "android") {
          const isLocationEnabled = await Location.hasServicesEnabledAsync();
          if (!isLocationEnabled) {
            if (!isActiveRun()) return;
            setStatus("denied");
            setErrorMessage("Location Services (GPS) must be turned ON to discover nearby players.");
            warnPermissionDebug("NetworkPermissions", "Location services disabled");
            return;
          }
        }

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
                runId,
                apiLevel,
                hasNearby,
                hasLocation,
                requestedPermissions: [NEARBY_PERM, LOCATION_PERM],
              },
            );

            if (!hasNearby || !hasLocation) {
              const results = await runSharedAndroidPermissionRequest(
                {
                  runId,
                  requestedPermissions: [NEARBY_PERM, LOCATION_PERM],
                },
                () =>
                  PermissionsAndroid.requestMultiple([
                    NEARBY_PERM as any,
                    LOCATION_PERM,
                  ]),
              );

              logPermissionDebug(
                "NetworkPermissions",
                "Android requestMultiple result",
                {
                  runId,
                  results,
                },
              );

              const isNearbyGranted =
                results[NEARBY_PERM] === PermissionsAndroid.RESULTS.GRANTED;
              const isLocationGranted =
                results[LOCATION_PERM] === PermissionsAndroid.RESULTS.GRANTED;

              if (!isNearbyGranted || !isLocationGranted) {
                if (!isActiveRun()) {
                  logPermissionDebug(
                    "NetworkPermissions",
                    "Discarded denied result from stale permission flow",
                    {
                      runId,
                      results,
                    },
                  );
                  return;
                }

                setStatus("denied");

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
                    runId,
                    apiLevel,
                    results,
                  },
                );
                return;
              }
            }
          } else {
            const hasLocation = await PermissionsAndroid.check(LOCATION_PERM);

            logPermissionDebug(
              "NetworkPermissions",
              "Existing Android location permission check",
              {
                runId,
                apiLevel,
                hasLocation,
                requestedPermission: LOCATION_PERM,
              },
            );

            if (!hasLocation) {
              const result = await runSharedAndroidPermissionRequest(
                {
                  runId,
                  requestedPermission: LOCATION_PERM,
                },
                () => PermissionsAndroid.request(LOCATION_PERM),
              );

              logPermissionDebug("NetworkPermissions", "Android request result", {
                runId,
                permission: LOCATION_PERM,
                result,
              });

              if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                if (!isActiveRun()) {
                  logPermissionDebug(
                    "NetworkPermissions",
                    "Discarded denied location result from stale permission flow",
                    {
                      runId,
                      permission: LOCATION_PERM,
                      result,
                    },
                  );
                  return;
                }

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
                    runId,
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

        if (!isActiveRun()) {
          logPermissionDebug(
            "NetworkPermissions",
            "Discarded successful result from stale permission flow",
            { runId },
          );
          return;
        }

        setStep("ready");
        setStatus("granted");
        logPermissionDebug(
          "NetworkPermissions",
          "Permission flow completed successfully",
          { runId },
        );
      } catch (error) {
        errorPermissionDebug("NetworkPermissions", "Permission flow crashed", {
          runId,
          error,
        });
        console.error("Handshake Error:", error);

        if (!isActiveRun()) return;

        setStatus("error");
        setErrorMessage("Something went wrong. Please retry.");
      }
    })();

    inFlightRunRef.current = flowPromise;

    try {
      await flowPromise;
    } finally {
      if (inFlightRunRef.current === flowPromise) {
        inFlightRunRef.current = null;
      }
    }
  }, [enabled, requireAndroidWifiPermissions, requireWifiIpAddress]);

  useEffect(() => {
    mountedRef.current = true;
    void runFlow();

    return () => {
      mountedRef.current = false;
    };
  }, [runFlow]);

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

      const isWifi = state.type === "wifi" && state.isConnected;
      const isCellular = state.type === "cellular" && state.isConnected;
      
      const hasValidWifi =
        isWifi || (Platform.OS === "android" && isCellular);

      if (!hasValidWifi && mountedRef.current) {
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
    });

    return unsubscribe;
  }, [enabled, requireWifiIpAddress]);

  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && status !== "granted") {
        logPermissionDebug("NetworkPermissions", "App became active, retrying flow (silent)");
        void runFlow(true);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [enabled, runFlow]);

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
