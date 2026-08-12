import React from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { toast } from "@/components/feedback/toast";

export const AppUpdateBanner: React.FC = () => {
  const { nativeUpdate, otaAvailable, applyUpdate } = useOTAUpdate();

  const isAvailable = nativeUpdate?.isAvailable || otaAvailable || __DEV__;
  if (!isAvailable) return null;

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
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 140 }}
      className="mx-5 mb-4"
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleUpdate}
        className="overflow-hidden rounded-3xl border border-amber-400/40 bg-slate-950/90 shadow-2xl shadow-amber-500/25"
      >
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(251,191,36,0.15)",
            "rgba(217,119,6,0.08)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Shimmer accent line at top */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(251,191,36,0.35)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 1, width: "100%" }}
        />

        <View className="flex-row items-center px-4 py-3.5">
          {/* Pulsing icon container */}
          <View className="relative">
            {/* Glow ring */}
            <MotiView
              from={{ opacity: 0.4, scale: 0.9 }}
              animate={{ opacity: 0.8, scale: 1.15 }}
              transition={{
                type: "timing",
                duration: 1500,
                loop: true,
              }}
              className="absolute -inset-1.5 rounded-2xl bg-amber-400/15"
            />
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/20">
              <Ionicons name="rocket" size={22} color="#FBBF24" />
            </View>
          </View>

          {/* Text content */}
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-amber-400">
                NEW UPDATE
              </Text>
              <View className="ml-2 rounded-md bg-amber-400/20 px-1.5 py-0.5">
                <Text className="font-main-bold text-[9px] text-amber-300">
                  {versionText}
                </Text>
              </View>
            </View>
            <Text className="mt-0.5 font-main-medium text-[12px] tracking-wide text-white/70">
              Tap to get new features & fixes
            </Text>
          </View>

          {/* Arrow / CTA */}
          <View className="h-10 w-10 items-center justify-center rounded-xl border border-amber-300/70 bg-amber-500 shadow-lg shadow-amber-500/40">
            <Ionicons name="arrow-up" size={20} color="#020617" />
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

export default React.memo(AppUpdateBanner);
