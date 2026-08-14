import React from "react";
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { toast } from "@/components/feedback/toast";
import { AppBannerCard } from "./AppBannerCard";

export const AppUpdateBanner: React.FC<{ forceVisible?: boolean }> = ({ forceVisible }) => {
  const { isNativeUpdate, otaAvailable, applyUpdate, latestVersion, updateUrl } = useOTAUpdate();

  const isAvailable = isNativeUpdate || otaAvailable || __DEV__;
  if (!forceVisible && !isAvailable) return null;

  const versionText = latestVersion
    ? `v${latestVersion}`
    : __DEV__
    ? "v2.4.0 [DEV]"
    : "LATEST";

  const handleUpdate = async () => {
    if (__DEV__) {
      toast.info("DEV Update", "Triggered App Update action in dev mode.");
      return;
    }
    if (otaAvailable) {
      try {
        await applyUpdate();
      } catch {
        // applyUpdate already logs and resets its own state.
      }
    } else if (updateUrl) {
      Linking.openURL(updateUrl);
    }
  };

  return (
    <AppBannerCard
      onPress={handleUpdate}
      icon={<Ionicons name="rocket" size={22} color="#FBBF24" />}
      title="NEW UPDATE"
      badge={versionText}
      description="Tap to get new features & fixes"
      ctaContent={<Ionicons name="arrow-up" size={20} color="#020617" />}
    />
  );
};

export default React.memo(AppUpdateBanner);
