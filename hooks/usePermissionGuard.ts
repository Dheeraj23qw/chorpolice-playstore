import { useState, useCallback, useEffect, useRef } from "react";
import { Alert, Linking, Platform, AppState, AppStateStatus } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import { toast } from "@/components/feedback/toast";

type PermissionState = "idle" | "checking" | "granted" | "denied" | "blocked";

const CRITICAL_PERMISSIONS = ["Location", "Camera"];
const OPTIONAL_PERMISSIONS = ["Notifications"];

export const usePermissionGuard = () => {
  const [state, setState] = useState<PermissionState>("idle");
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [missingCritical, setMissingCritical] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const checkingRef = useRef(false);

  /**
   * Requests a specific permission and handles the "Denied" case
   */
  const requestPermission = useCallback(async (
    permissionName: string,
    requestFn: () => Promise<{ status: string; canAskAgain?: boolean }>
  ) => {
    const { status, canAskAgain } = await requestFn();

    if (status === "granted") return true;

    if (!canAskAgain) {
      return "blocked";
    }

    return "denied";
  }, []);

  /**
   * Internal function to check statuses without triggering "checking" state
   */
  const checkCurrentStatuses = useCallback(async () => {
    const missing: string[] = [];
    let isBlocked = false;

    try {
      const [locStatus, camStatus] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Camera.getCameraPermissionsAsync(),
      ]);

      if (locStatus.status !== "granted") {
        missing.push("Location");
        if (!locStatus.canAskAgain) isBlocked = true;
      }

      if (camStatus.status !== "granted") {
        missing.push("Camera");
        if (!camStatus.canAskAgain) isBlocked = true;
      }

      if (Platform.OS === "android" && Platform.Version >= 33) {
        const notifStatus = await Notifications.getPermissionsAsync();
        if (notifStatus.status !== "granted") {
          missing.push("Notifications");
        }
      }

      return { missing, isBlocked };
    } catch (err) {
      console.error("Status Check Failed:", err);
      return { missing: [], isBlocked: false };
    }
  }, []);

  /**
   * Master function to check/request all game-critical permissions.
   * If 'request' is false, it performs a silent refresh.
   */
  const checkAllPermissions = useCallback(async (request = true) => {
    if (checkingRef.current) return false;
    checkingRef.current = true;

    try {
      if (request) setState("checking");

      const { missing, isBlocked } = await checkCurrentStatuses();
      const criticalMissing = missing.filter(p => CRITICAL_PERMISSIONS.includes(p));
      const allCriticalGranted = criticalMissing.length === 0;

      if (allCriticalGranted) {
        setMissingPermissions(missing); // Still keep track of optional ones
        setMissingCritical([]);
        setState("granted");
        return true;
      }

      if (request) {
        // ... same request logic ...
        const newMissing: string[] = [];
        let nowBlocked = false;

        // 1. LOCATION (Critical)
        const locStatus = await Location.getForegroundPermissionsAsync();
        if (locStatus.status !== "granted") {
          const result = await requestPermission("Location", Location.requestForegroundPermissionsAsync);
          if (result === "blocked") nowBlocked = true;
          if (result !== true) newMissing.push("Location");
        }

        // 2. CAMERA (Critical)
        const camStatus = await Camera.getCameraPermissionsAsync();
        if (camStatus.status !== "granted") {
          const result = await requestPermission("Camera", Camera.requestCameraPermissionsAsync);
          if (result === "blocked") nowBlocked = true;
          if (result !== true) newMissing.push("Camera");
        }

        // 3. NOTIFICATIONS (Optional)
        if (Platform.OS === "android" && Platform.Version >= 33) {
          const notifStatus = await Notifications.getPermissionsAsync();
          if (notifStatus.status !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== "granted") newMissing.push("Notifications");
          }
        }

        const newCriticalMissing = newMissing.filter(p => CRITICAL_PERMISSIONS.includes(p));
        
        setAttemptCount((prev) => prev + 1);
        setMissingPermissions(newMissing);
        setMissingCritical(newCriticalMissing);
        
        if (newCriticalMissing.length === 0) {
          setState("granted");
          return true;
        }

        setState(nowBlocked || isBlocked ? "blocked" : "denied");
        return false;
      }

      // Silent update
      setMissingPermissions(missing);
      setMissingCritical(criticalMissing);
      setState(isBlocked ? "blocked" : "denied");
      return criticalMissing.length === 0;
    } catch (err) {
      console.error("Permission Check Failed:", err);
      setState("denied");
      return false;
    } finally {
      checkingRef.current = false;
    }
  }, [checkCurrentStatuses, requestPermission]);

  // Check on mount
  useEffect(() => {
    void checkAllPermissions(false);
  }, [checkAllPermissions]);

  // Listen for app state changes (user returning from settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // When coming back to the app, check if permissions were granted in settings
        void checkAllPermissions(false);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [checkAllPermissions]);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    state,
    missingPermissions,
    missingCritical,
    attemptCount,
    checkAllPermissions,
    openSettings,
    resetAttempts: () => setAttemptCount(0),
  };
};
