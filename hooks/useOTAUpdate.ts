import { useCallback, useEffect, useRef, useState } from "react";
import * as Updates from "expo-updates";
import { checkAppUpdate } from "@/utils/versionCheck";

export const useOTAUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [nativeUpdate, setNativeUpdate] = useState<{ isAvailable: boolean; latestVersion: string; updateUrl: string } | null>(null);

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
      console.log("[Update] Checking for native version updates...");
      const nativeResult = await checkAppUpdate();
      if (nativeResult.isAvailable) {
        console.log("[Update] Native update required:", nativeResult.latestVersion);
        setNativeUpdate(nativeResult);
        // If native update is required, we usually don't want to proceed with OTA 
        // because the binary itself needs replacement.
        return;
      }

      console.log("[OTA] Checking for bundle updates...");
      
      // Use a timeout to prevent hanging on bad connections
      const checkTask = Updates.checkForUpdateAsync();
      const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Update check timed out")), 10000));
      
      const update = await Promise.race([checkTask, timeoutTask]) as Updates.UpdateCheckResult;

      if (!update.isAvailable) {
        console.log("[OTA] App is up to date (Version: " + Updates.updateId + ")");
        return;
      }

      console.log("[OTA] Update found. Downloading version: ", update.manifest?.id);
      setIsUpdating(true);
      setUpdateError(null);

      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        console.log("[OTA] Update downloaded successfully. Immediate reload triggered.");
        
        // Final safety delay before reload
        reloadTimeoutRef.current = setTimeout(() => {
          Updates.reloadAsync();
        }, 1000);
      } else {
        console.log("[OTA] No new update bundle fetched.");
        setIsUpdating(false);
      }
    } catch (error: any) {
      console.warn("[OTA] Update cycle failed or timed out:", error.message);
      // Don't set error state if it's just a timeout/network issue, just let them play
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
    nativeUpdate,
    checkAndApplyUpdate,
  };
};
