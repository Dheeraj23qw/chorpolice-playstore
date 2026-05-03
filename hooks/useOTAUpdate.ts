import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Updates from "expo-updates";

/**
 * Hook to handle OTA updates using expo-updates.
 * - Checks for updates on mount
 * - If available, downloads and applies immediately
 * - Provides status for UI feedback
 */
export const useOTAUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const checkAndApplyUpdate = async () => {
    // Only run in production builds with expo-updates enabled
    if (__DEV__ || !Updates.isEnabled) {
      console.log("[OTA] Updates disabled or in DEV mode.");
      return;
    }

    try {
      console.log("[OTA] Checking for updates...");
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log("[OTA] Update found! Downloading...");
        setIsUpdating(true);

        // Download the update
        await Updates.fetchUpdateAsync();

        console.log("[OTA] Update downloaded. Reloading app...");
        
        // Final alert before reload (optional but good for UX)
        // We use a small delay to ensure the UI has time to show the "Updating" state
        setTimeout(async () => {
          await Updates.reloadAsync();
        }, 1000);
      } else {
        console.log("[OTA] App is up to date.");
      }
    } catch (error: any) {
      console.error("[OTA] Update failed:", error);
      setUpdateError(error.message);
      setIsUpdating(false);
      
      // We don't block the user if update fails, just log it.
    }
  };

  useEffect(() => {
    checkAndApplyUpdate();
  }, []);

  return { isUpdating, updateError, checkAndApplyUpdate };
};
