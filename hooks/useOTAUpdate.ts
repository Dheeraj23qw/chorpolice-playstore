import { useCallback, useEffect, useRef, useState } from "react";
import * as Updates from "expo-updates";

export const useOTAUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const hasCheckedRef = useRef(false);
  const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAndApplyUpdate = useCallback(async () => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    if (__DEV__ || !Updates.isEnabled) {
      console.log("[OTA] Updates disabled or in DEV mode.");
      return;
    }

    try {
      console.log("[OTA] Checking for updates...");

      const update = await Updates.checkForUpdateAsync();

      if (!update.isAvailable) {
        console.log("[OTA] App is up to date.");
        return;
      }

      console.log("[OTA] Update found. Downloading...");
      setIsUpdating(true);
      setUpdateError(null);

      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        console.log("[OTA] Update downloaded. Reloading...");

        reloadTimeoutRef.current = setTimeout(() => {
          Updates.reloadAsync();
        }, 800);
      } else {
        console.log("[OTA] No new update fetched.");
        setIsUpdating(false);
      }
    } catch (error: any) {
      console.error("[OTA] Update failed:", error);
      setUpdateError(error?.message ?? "OTA update failed");
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    checkAndApplyUpdate();

    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, [checkAndApplyUpdate]);

  return {
    isUpdating,
    updateError,
    checkAndApplyUpdate,
  };
};
