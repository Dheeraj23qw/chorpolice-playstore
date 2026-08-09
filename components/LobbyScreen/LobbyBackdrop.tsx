import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";

type LobbyBackdropProps = {
  blurIntensity?: number;
  gradientColors?: [string, string, string];
};

export const LobbyBackdrop = ({
  blurIntensity = 18,
  gradientColors = ["rgba(0,0,0,0.78)", "rgba(0,0,0,0.38)", "transparent"],
}: LobbyBackdropProps) => (
  <View className="absolute inset-0">
    <Image
      source={require("@/assets/images/bg/image.webp")}
      className="h-full w-full"
      resizeMode="cover"
    />

    {Platform.OS === "ios" ? (
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
    ) : (
      <View className="absolute inset-0 bg-black/45" />
    )}

    <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
  </View>
);
