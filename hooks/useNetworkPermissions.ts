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

// What kind of network the device actually has
export type NetworkContext =
  | "wifi"          // Standard router WiFi — ideal
  | "hotspot_host"  // Device is hosting a hotspot (cellular type but acting as AP)
  | "cellular"      // Mobile data only (can still join via hotspot)
  | "none"          // Truly offline
  | "unknown";

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

/**
 * Classify the current network state into a human-meaningful context.
 * 
 * PERMUTATION TABLE (all possible NetInfo states):
 * ┌─────────────┬─────────────┬──────────┬──────────────┬──────────────────────┐
 * │ type        │ isConnected │ hasIp    │ Result       │ Reason               │
 * ├─────────────┼─────────────┼──────────┼──────────────┼──────────────────────┤
 * │ wifi        │ true/false  │ any      │ wifi         │ On WiFi router       │
 * │ ethernet    │ true/false  │ any      │ wifi         │ Wired                │
 * │ cellular    │ true        │ any      │ cellular     │ Mobile data on       │
 * │ cellular    │ false       │ any(And) │ hotspot_host │ Hotspot ON, data OFF │
 * │ cellular    │ false       │ any(iOS) │ none         │ No connection        │
 * │ none        │ false       │ true(iOS)│ hotspot_host │ iOS hotspot hosting  │
 * │ none        │ false       │ false    │ none         │ Truly offline        │
 * │ none        │ true        │ any      │ unknown      │ Weird state          │
 * │ unknown     │ true        │ any      │ unknown      │ Transient            │
 * │ unknown     │ false       │ any      │ none         │ Offline              │
 * │ vpn/other   │ true        │ any      │ wifi         │ Connected somehow    │
 * │ vpn/other   │ false       │ any      │ none         │ Disconnected         │
 * └─────────────┴─────────────┴──────────┴──────────────┴──────────────────────┘
 */
const classifyNetworkContext = (state: any): NetworkContext => {
  const type = state.type;
  const isConnected = !!state.isConnected;
  const hasLocalIp = Boolean(
    state.details && "ipAddress" in state.details && state.details.ipAddress,
  );
  const ipAddress = state.details?.ipAddress || "none";

  console.log(
    `[NetworkPermissions] 🔍 Classifying: type=${type}, connected=${isConnected}, ` +
    `ip=${ipAddress}, platform=${Platform.OS}`,
  );

  let result: NetworkContext;
  let reason: string;

  if (type === "wifi" || type === "ethernet") {
    result = "wifi";
    reason = `${type} interface detected`;
  } else if (type === "cellular") {
    if (isConnected) {
      // Mobile data is ON. This device can still HOST a hotspot simultaneously.
      // The IP layer (NetworkUtils) will detect the cellular IP and fall back
      // to the hotspot gateway IP (192.168.43.1).
      result = "cellular";
      reason = "cellular data active (can host hotspot AND join others)";
    } else if (Platform.OS === "android") {
      // Android: cellular type but NOT connected = device is hosting hotspot
      // with mobile data OFF. The AP interface (ap0) is up but NetInfo
      // reports cellular because it's the primary radio.
      result = "hotspot_host";
      reason = "Android cellular but disconnected → likely hosting hotspot (data OFF)";
    } else {
      result = "none";
      reason = "iOS cellular but disconnected → truly offline";
    }
  } else if (type === "none" || type === "unknown") {
    if (Platform.OS === "ios" && hasLocalIp) {
      // iOS hotspot: NetInfo reports type=none but the device has a local IP
      // because the AP interface is active.
      result = "hotspot_host";
      reason = "iOS type=none but has local IP → hosting hotspot";
    } else if (isConnected) {
      result = "unknown";
      reason = `${type} but isConnected=true → transient/unknown`;
    } else {
      result = "none";
      reason = `${type}, disconnected, no IP → truly offline`;
    }
  } else {
    // vpn, other, wimax, etc.
    result = isConnected ? "wifi" : "none";
    reason = `exotic type=${type}, connected=${isConnected}`;
  }

  console.log(
    `[NetworkPermissions] ✅ Classification: ${result.toUpperCase()} (${reason})`,
  );

  return result;
};

const getErrorMessageForContext = (ctx: NetworkContext, requireWifi: boolean): string | null => {
  switch (ctx) {
    case "none":
      return requireWifi
        ? "No network detected. Connect to WiFi or enable your Mobile Hotspot to host."
        : "No network detected. Connect to WiFi or a Hotspot to join.";
    default:
      return null;
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
  const [networkContext, setNetworkContext] = useState<NetworkContext>("unknown");

  const mountedRef = useRef(true);
  const activeRunIdRef = useRef(0);
  const inFlightRunRef = useRef<Promise<void> | null>(null);
  // Internal ref so listeners always read LIVE status without stale closures
  const statusRef = useRef<PermissionStatus>("pending");

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
        setNetworkContext("unknown");
        return;
      }

      if (!isActiveRun()) return;

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

        const ctx = classifyNetworkContext(netState);
        if (isActiveRun()) {
          setNetworkContext(ctx);
        }

        // ============================================================
        // PERMUTATION TABLE:
        // ============================================================
        // ctx = "wifi"         → proceed to permissions
        // ctx = "cellular"     → proceed (joiner on mobile data)
        // ctx = "hotspot_host" → proceed (this device IS the router)
        // ctx = "none"         → BLOCK with clear message
        // ctx = "unknown"      → proceed optimistically
        // ============================================================
        if (ctx === "none") {
          if (!isActiveRun()) return;
          const msg = getErrorMessageForContext(ctx, !!requireWifiIpAddress);
          console.log(`[NetworkPermissions] ❌ STATUS → no_wifi (ctx=none, run=${runId})`);
          setStatus("no_wifi");
          setErrorMessage(msg);
          warnPermissionDebug("NetworkPermissions", "No network detected", { runId, ctx });
          return;
        }

        // Android Location Services check (needed for WiFi scanning)
        // SKIP this for hotspot_host — they don't need to scan, they ARE the AP.
        if (Platform.OS === "android" && ctx !== "hotspot_host") {
          const isLocationEnabled = await Location.hasServicesEnabledAsync();
          if (!isLocationEnabled) {
            if (!isActiveRun()) return;
            console.log(`[NetworkPermissions] ❌ STATUS → denied (GPS/Location services OFF)`);
            setStatus("denied");
            setErrorMessage(
              "Turn on Location Services (GPS) so the app can detect the local network."
            );
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
              { runId, apiLevel, hasNearby, hasLocation },
            );

            if (!hasNearby || !hasLocation) {
              const results = await runSharedAndroidPermissionRequest(
                { runId },
                () =>
                  PermissionsAndroid.requestMultiple([
                    NEARBY_PERM as any,
                    LOCATION_PERM,
                  ]),
              );

              const isNearbyGranted =
                results[NEARBY_PERM] === PermissionsAndroid.RESULTS.GRANTED;
              const isLocationGranted =
                results[LOCATION_PERM] === PermissionsAndroid.RESULTS.GRANTED;

              if (!isNearbyGranted || !isLocationGranted) {
                if (!isActiveRun()) return;

                const isPermanent =
                  results[NEARBY_PERM] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                  results[LOCATION_PERM] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

                console.log(
                  `[NetworkPermissions] ❌ STATUS → denied ` +
                  `(nearby=${isNearbyGranted}, location=${isLocationGranted}, permanent=${isPermanent})`,
                );
                setStatus("denied");

                setErrorMessage(
                  isPermanent
                    ? "Permissions permanently denied. Open Settings to enable Location & Nearby WiFi."
                    : "Location & Nearby WiFi permissions are required for LAN multiplayer.",
                );
                warnPermissionDebug("NetworkPermissions", "Android permission denied", { results });
                return;
              }
            }
          } else {
            const hasLocation = await PermissionsAndroid.check(LOCATION_PERM);

            if (!hasLocation) {
              const result = await runSharedAndroidPermissionRequest(
                { runId },
                () => PermissionsAndroid.request(LOCATION_PERM),
              );

              if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                if (!isActiveRun()) return;
                setStatus("denied");
                setErrorMessage(
                  result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                    ? "Location permanently denied. Open Settings to enable it."
                    : "Location permission is required for LAN multiplayer.",
                );
                warnPermissionDebug("NetworkPermissions", "Location denied", { result });
                return;
              }
            }
          }
        }

        if (!isActiveRun()) return;

        setStep("ready");
        console.log(`[NetworkPermissions] ✅ STATUS → granted (ctx=${ctx}, run=${runId})`);
        setStatus("granted");
        setErrorMessage(null);
        logPermissionDebug("NetworkPermissions", "Permission flow completed", { runId, ctx });

      } catch (error) {
        errorPermissionDebug("NetworkPermissions", "Permission flow crashed", { runId, error });
        console.error("Handshake Error:", error);
        if (!isActiveRun()) return;
        setStatus("error");
        setErrorMessage("Something went wrong checking network. Please retry.");
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

  // Keep statusRef in sync with state so listeners always have the live value
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Live NetInfo listener — only re-runs flow when network state actually changes meaningfully
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      logPermissionDebug("NetworkPermissions", "NetInfo listener update", {
        type: state.type,
        isConnected: state.isConnected,
        details: state.details,
      });

      const ctx = classifyNetworkContext(state);
      if (mountedRef.current) {
        setNetworkContext(ctx);
      }

      // ── LOSS: network just dropped → mark immediately, no need to re-run full flow
      if (ctx === "none" && mountedRef.current) {
        statusRef.current = "no_wifi"; // sync ref immediately
        setStatus("no_wifi");
        setErrorMessage(
          requireWifiIpAddress
            ? "Network lost. Reconnect to WiFi or re-enable your Hotspot."
            : "Network lost. Please reconnect to continue.",
        );
        warnPermissionDebug("NetworkPermissions", "Network lost in listener", { ctx });
        return;
      }

      // ── RECOVERY: network came back but we were in a bad state → re-run full flow
      // Skip if already granted and stable (avoid unnecessary permission re-checks on every tick)
      const currentStatus = statusRef.current;
      if (ctx !== "none" && currentStatus !== "granted" && mountedRef.current) {
        logPermissionDebug("NetworkPermissions", "Network recovered, re-running flow", { ctx, currentStatus });
        void runFlow(true);
      }
    });

    return unsubscribe;
  }, [enabled, requireWifiIpAddress, runFlow]);

  // App foreground resume — ALWAYS re-run on active (catches grant AND revocation from Settings)
  useEffect(() => {
    if (!enabled) return;

    let prevState = AppState.currentState;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (prevState === "background" && nextAppState === "active") {
        logPermissionDebug(
          "NetworkPermissions",
          "App returned from background — re-checking all permissions silently",
          { prevStatus: statusRef.current },
        );
        void runFlow(true);
      }
      prevState = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [enabled, runFlow]);

  return {
    step,
    status,
    retry: runFlow,
    errorMessage,
    networkContext,
    openSettings: () => {
      logPermissionDebug("NetworkPermissions", "Opening app settings");
      return Linking.openSettings();
    },
  };
};
