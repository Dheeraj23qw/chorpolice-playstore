import React from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface OfflineSetupBannerProps {
  playerCount: number;
}

export const OfflineSetupBanner: React.FC<OfflineSetupBannerProps> = ({
  playerCount,
}) => {
  return (
    <View className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-white/10">
      <BlurView
        intensity={18}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(99,102,241,0.20)", "rgba(255,255,255,0.03)"]}
        style={StyleSheet.absoluteFill}
      />

      <View className="flex-row items-center px-5 py-5">
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-[22px] bg-white/10">
          <Ionicons name="phone-portrait-outline" size={28} color="white" />
        </View>

        <View className="flex-1">
          <Text
            style={{ fontSize: rf(0.98) }}
            className="font-main-bold uppercase tracking-[3px] text-indigo-300/75"
          >
            Offline Mode
          </Text>
          <Text
            style={{ fontSize: rf(1.8) }}
            className="mt-1 font-main-bold text-white"
          >
            One Phone, {playerCount} Players
          </Text>
          <Text
            style={{ fontSize: rf(1.0), lineHeight: rf(1.55) }}
            className="mt-1 font-main-bold text-white/45"
          >
            Pass the phone, set names, and start the game together.
          </Text>
        </View>
      </View>
    </View>
  );
};
