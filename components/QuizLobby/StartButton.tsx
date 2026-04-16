import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/Text";
import { LinearGradient } from "expo-linear-gradient";

export const StartButton = ({ lobby }: any) => {
  const isReady = lobby.players.length >= 4;

  return (
    <View className="absolute bottom-0 w-full px-6 pb-12 pt-10">
      {lobby.isHost ? (
        <Pressable
          disabled={!isReady}
          onPress={() => lobby.setIsBettingModalVisible(true)}
          className="overflow-hidden rounded-3xl"
        >
          {/* 🔥 Soft Glow */}
          {isReady && (
            <View className="absolute inset-0 rounded-3xl bg-purple-500/15 blur-3xl" />
          )}

          {/* 🎯 Glass Button */}
          <LinearGradient
            colors={
              isReady
                ? [
                    "rgba(124,58,237,0.55)", // purple
                    "rgba(79,70,229,0.45)", // indigo
                  ]
                : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
            }
            className={`items-center rounded-3xl border py-5 ${
              isReady ? "border-purple-300/30" : "border-white/10"
            }`}
          >
            {/* ✨ Glass highlight overlay */}
            <View className="absolute inset-0 rounded-3xl bg-white/5" />

            {/* 📝 Text */}
            <Text
              className={`font-main-bold tracking-wide ${
                isReady ? "text-white" : "text-white/40"
              }`}
            >
              {isReady ? "LETS GO!" : `WAITING (${lobby.players.length}/4)`}
            </Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <View className="items-center py-5">
          <Text className="text-white/30">Select a room from above</Text>
        </View>
      )}
    </View>
  );
};
