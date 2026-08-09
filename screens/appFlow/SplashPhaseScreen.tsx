import React from "react";
import { View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";

export default function SplashPhaseScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <LinearGradient
        colors={["#020617", "#111827", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="absolute inset-0 items-center justify-center bg-black/20">
        <Text className="text-center font-main-bold text-5xl tracking-tight text-white">
          Chor Police
        </Text>
        <Text className="mt-3 text-sm uppercase tracking-[4px] text-white/60">
          Loading
        </Text>
      </View>
    </View>
  );
}
