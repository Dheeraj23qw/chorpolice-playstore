import React from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { toast } from "@/components/feedback/toast";
import { AppBannerCard } from "./AppBannerCard";

export const AppUpdateBanner: React.FC<{ forceVisible?: boolean }> = ({ forceVisible }) => {
  const { nativeUpdate, otaAvailable, applyUpdate } = useOTAUpdate();

  const isAvailable = nativeUpdate?.isAvailable || otaAvailable || __DEV__;
  if (!forceVisible && !isAvailable) return null;

  const versionText = nativeUpdate?.latestVersion
    ? `v${nativeUpdate.latestVersion}`
    : __DEV__
    ? "v2.4.0 [DEV]"
    : "LATEST";

  const handleUpdate = () => {
    if (__DEV__) {
      toast.info("DEV Update", "Triggered App Update action in dev mode.");
      return;
    }
    if (otaAvailable) {
      applyUpdate();
    } else if (nativeUpdate?.updateUrl) {
      Linking.openURL(nativeUpdate.updateUrl);
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
