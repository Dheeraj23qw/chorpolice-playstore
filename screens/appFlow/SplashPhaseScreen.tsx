import React from "react";
import { View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";

export default function SplashPhaseScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <LinearGradient
        colors={["#020617", "#111827", "#050508"]}
        className="absolute inset-0"
      />
      <Image
        source={require("@/assets/modalImages/intro.webp")}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      {/* Overlay Branding */}
      <View className="absolute inset-0 items-center justify-center bg-black/20">
        <Text className="font-main-bold text-5xl tracking-tight text-white text-center">
          Chor Police
        </Text>
        <Text className="mt-3 text-sm uppercase tracking-[4px] text-white/60">
          Loading
        </Text>
      </View>
    </View>
  );
}
