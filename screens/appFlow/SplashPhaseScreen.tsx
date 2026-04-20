import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";

export default function SplashPhaseScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <LinearGradient
        colors={["#020617", "#111827", "#050508"]}
        className="absolute inset-0"
      />
      <Text className="font-main-bold text-5xl tracking-tight text-white">
        Chor Police
      </Text>
      <Text className="mt-3 text-sm uppercase tracking-[4px] text-white/40">
        Loading
      </Text>
    </View>
  );
}
