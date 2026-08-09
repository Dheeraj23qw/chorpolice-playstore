import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface OfflineInvestigationBannerProps {
  message: string;
}

export const OfflineInvestigationBanner: React.FC<
  OfflineInvestigationBannerProps
> = ({ message }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -10, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "timing", duration: 320 }}
      className="overflow-hidden rounded-[28px]"
      style={{ marginBottom: 20 }}
    >
      <LinearGradient
        colors={["rgba(79,70,229,0.9)", "rgba(30,27,75,0.96)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-[28px] border border-white/10"
      >
        <View className="absolute inset-0 bg-white/5" />
        <View className="absolute left-4 right-4 top-0 h-[1px] rounded-full bg-white/30" />
        <View className="flex-row items-center px-5 py-4">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <Ionicons name="shield-half-outline" size={20} color="#c7d2fe" />
          </View>
          <Text
            style={{ fontSize: rf(1.45), lineHeight: rf(2.0) }}
            className="flex-1 font-main-bold uppercase tracking-[1px] text-white"
          >
            {message}
          </Text>
        </View>
      </LinearGradient>
    </MotiView>
  );
};
