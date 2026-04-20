import React from "react";
import { ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <LinearGradient
        colors={["#020617", "#111827", "#050508"]}
        className="absolute inset-0"
      />

      <View className="items-center rounded-[32px] border border-white/10 bg-white/5 px-8 py-7">
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text className="mt-5 font-main-bold text-2xl text-white">
          Preparing intro
        </Text>
        <Text className="mt-2 text-center text-sm text-white/50">
          Loading audio and launch assets for smooth playback.
        </Text>
      </View>
    </View>
  );
}
