import { useCallback, useEffect, useRef, useState } from "react";
import * as Updates from "expo-updates";
import store from "@/redux/store";
import { checkAppUpdate } from "@/utils/versionCheck";

export const useOTAUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [nativeUpdate, setNativeUpdate] = useState<{ isAvailable: boolean; latestVersion: string; updateUrl: string } | null>(null);
  const [otaAvailable, setOtaAvailable] = useState(false);

  const hasCheckedRef = useRef(false);

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
        console.log("[Update] Native update available:", nativeResult.latestVersion);
        setNativeUpdate(nativeResult);
        return;
      }

      console.log("[OTA] Checking for bundle updates...");
      
      const checkTask = Updates.checkForUpdateAsync();
      const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Update check timed out")), 10000));
      
      const update = await Promise.race([checkTask, timeoutTask]) as Updates.UpdateCheckResult;

      if (!update.isAvailable) {
        console.log("[OTA] App is up to date");
        return;
      }

      console.log("[OTA] Update found. Downloading in background...");
      // Background download
      const result = await Updates.fetchUpdateAsync();
      
      if (result.isNew) {
        console.log("[OTA] Update downloaded successfully. Notifying UI.");
        setOtaAvailable(true);
      }
      
    } catch (error: any) {
      console.warn("[OTA] Update cycle failed or timed out:", error.message);
    }
  }, []);

  const applyUpdate = async () => {
    // 🛡️ CRITICAL GUARD: Never reload during an active match
    const currentPhase = store.getState().session.gamePhase;
    if (currentPhase !== "idle") {
      console.warn("[OTA] Update reload deferred: game is active (phase: " + currentPhase + ")");
      return;
    }

    try {
      setIsUpdating(true);
      console.log("[OTA] Reloading app to apply update...");
      await Updates.reloadAsync();
    } catch (error: any) {
      console.error("[OTA] Reload failed:", error);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    checkAndApplyUpdate();
  }, [checkAndApplyUpdate]);

  return {
    isUpdating,
    updateError,
    nativeUpdate,
    otaAvailable,
    checkAndApplyUpdate,
    applyUpdate,
    setOtaAvailable,
  };
};
