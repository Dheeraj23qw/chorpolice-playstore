import { useState, useCallback, useEffect } from "react";
import { Alert, Linking, Platform } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import { toast } from "@/components/feedback/toast";

export type PermissionState = "idle" | "checking" | "granted" | "denied" | "blocked";

export const usePermissionGuard = () => {
  const [state, setState] = useState<PermissionState>("idle");
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);

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
   * Master function to check/request all game-critical permissions
   */
  const checkAllPermissions = useCallback(async () => {
    setState("checking");
    const missing: string[] = [];
    let blocked = false;

    try {
      // 1. LOCATION & NEARBY
      const locStatus = await Location.getForegroundPermissionsAsync();
      if (locStatus.status !== "granted") {
        const result = await requestPermission("Location", Location.requestForegroundPermissionsAsync);
        if (result === "blocked") blocked = true;
        if (result !== true) missing.push("Location");
      }

      // 2. CAMERA
      const camStatus = await Camera.getCameraPermissionsAsync();
      if (camStatus.status !== "granted") {
        const result = await requestPermission("Camera", Camera.requestCameraPermissionsAsync);
        if (result === "blocked") blocked = true;
        if (result !== true) missing.push("Camera");
      }

      // 3. NOTIFICATIONS (Android 13+)
      if (Platform.OS === "android" && Platform.Version >= 33) {
        const notifStatus = await Notifications.getPermissionsAsync();
        if (notifStatus.status !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== "granted") missing.push("Notifications");
        }
      }

      if (missing.length === 0) {
        setState("granted");
        return true;
      }

      setMissingPermissions(missing);
      setState(blocked ? "blocked" : "denied");
      return false;
    } catch (err) {
      console.error("Permission Check Failed:", err);
      setState("denied");
      return false;
    }
  }, [requestPermission]);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    state,
    missingPermissions,
    checkAllPermissions,
    openSettings,
  };
};
