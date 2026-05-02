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
  const [servicesDisabled, setServicesDisabled] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const activeRunIdRef = useRef(0);
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
    let servicesDisabled = false;

    try {
      const [locStatus, camStatus, servicesEnabled] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Camera.getCameraPermissionsAsync(),
        Location.hasServicesEnabledAsync(),
      ]);

      if (locStatus.status !== "granted") {
        missing.push("Location");
        if (!locStatus.canAskAgain) isBlocked = true;
      } else if (!servicesEnabled) {
        servicesDisabled = true;
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

      return { missing, isBlocked, servicesDisabled };
    } catch (err) {
      console.error("Status Check Failed:", err);
      return { missing: [], isBlocked: false, servicesDisabled: false };
    }
  }, []);

  /**
   * Master function to check/request all game-critical permissions.
   * If 'request' is false, it performs a silent refresh.
   */
  const checkAllPermissions = useCallback(async (request = true) => {
    if (checkingRef.current && request) return false;
    
    const runId = activeRunIdRef.current + 1;
    activeRunIdRef.current = runId;
    checkingRef.current = true;

    const isActive = () => activeRunIdRef.current === runId;

    try {
      if (request) setState("checking");

      const { missing, isBlocked, servicesDisabled } = await checkCurrentStatuses();
      
      if (!isActive()) return false;
      const criticalMissing = missing.filter(p => CRITICAL_PERMISSIONS.includes(p));
      const allCriticalGranted = criticalMissing.length === 0 && !servicesDisabled;

      if (allCriticalGranted) {
        if (isActive()) {
          setMissingPermissions(missing);
          setMissingCritical([]);
          setServicesDisabled(false);
          setState("granted");
        }
        return true;
      }

      if (servicesDisabled && criticalMissing.length === 0) {
        // Location permission is granted, but GPS is OFF
        if (request && isActive()) {
          toast.error("Location Services Disabled", "Please turn on GPS/Location in your phone settings to find players.");
        }
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

        if (!isActive()) return false;

        // 2. CAMERA (Critical)
        const camStatus = await Camera.getCameraPermissionsAsync();
        if (camStatus.status !== "granted") {
          const result = await requestPermission("Camera", Camera.requestCameraPermissionsAsync);
          if (result === "blocked") nowBlocked = true;
          if (result !== true) newMissing.push("Camera");
        }

        if (!isActive()) return false;

        // 3. NOTIFICATIONS (Optional)
        if (Platform.OS === "android" && Platform.Version >= 33) {
          const notifStatus = await Notifications.getPermissionsAsync();
          if (notifStatus.status !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== "granted") newMissing.push("Notifications");
          }
        }

        if (!isActive()) return false;

        const newCriticalMissing = newMissing.filter(p => CRITICAL_PERMISSIONS.includes(p));
        
        setAttemptCount((prev) => prev + 1);
        setMissingPermissions(newMissing);
        setMissingCritical(newCriticalMissing);
        
        if (newCriticalMissing.length === 0 && !servicesDisabled) {
          setState("granted");
          return true;
        }

        setServicesDisabled(servicesDisabled);

        setState(nowBlocked || isBlocked ? "blocked" : "denied");
        return false;
      }

      // Silent update
      if (isActive()) {
        setMissingPermissions(missing);
        setMissingCritical(criticalMissing);
        setServicesDisabled(servicesDisabled);
        setState(isBlocked ? "blocked" : "denied");
      }
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
  // ✅ FIX: Always re-check on background→active transition.
  // Previous code used `state !== "granted"` which was a stale closure —
  // if the user granted in Settings and came back, `state` was still "denied"
  // in the closure, causing an unnecessary re-check (harmless) BUT if state
  // was "granted" and user REVOKED, it would skip the check entirely (bug).
  useEffect(() => {
    let prevAppState = AppState.currentState;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Only fire on genuine background → active (not inactive flickers)
      if (prevAppState === "background" && nextAppState === "active") {
        void checkAllPermissions(false);
      }
      prevAppState = nextAppState;
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
    servicesDisabled,
    attemptCount,
    checkAllPermissions,
    openSettings,
    resetAttempts: () => setAttemptCount(0),
  };
};
