import React from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";

export const StartButton = ({ lobby }: any) => {
  const isHostReady =
    !lobby.isHost || lobby.connectionStatus === "HOSTING";

  const isReady =
    lobby.players.length === 4 && isHostReady;

  const humanCount = lobby.players.filter(
    (p: any) => !p.isBot
  ).length;

  const buttonText = isReady
    ? "START MATCH"
    : isHostReady
    ? `WAITING (${lobby.players.length}/4)`
    : "STARTING LOBBY...";

  const buttonHint = isReady
    ? humanCount < lobby.maxPlayers
      ? "All seats are ready. Start whenever you want."
      : "Everyone is ready. Launch the match."
    : isHostReady
    ? "Preparing a full 4-seat room"
    : lobby.errorMessage || "Local server is still starting.";

  if (!lobby.isHost) {
    return (
      <View className="absolute bottom-0 w-full px-6 pb-12 pt-10">
        <Text className="text-center text-white/30">
          Waiting for the host to start the match
        </Text>
      </View>
    );
  }

  return (
    <View className="absolute bottom-0 w-full px-6 pb-12 pt-10">
      <Pressable
        disabled={!isReady}
        onPress={async () => {
          if (!isReady) return;

          await Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Medium
          );

          lobby.setIsBettingModalVisible(true);
        }}
      >
        {({ pressed }) => (
          <MotiView
            animate={{
              scale: pressed ? 0.97 : 1,
              opacity: isReady ? 1 : 0.7,
            }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 250,
            }}
            className="overflow-hidden rounded-3xl"
          >
            {/* 🔥 PULSING GLOW WHEN READY */}
            {isReady && (
              <MotiView
                from={{ opacity: 0.3, scale: 0.95 }}
                animate={{ opacity: 0.6, scale: 1.1 }}
                transition={{
                  loop: true,
                  duration: 1200,
                  type: "timing",
                }}
                className="absolute inset-0 rounded-3xl bg-purple-500/20 blur-3xl"
              />
            )}

            {/* 🌫 GLASS CORE */}
            <LinearGradient
              colors={
                isReady
                  ? [
                      "rgba(124,58,237,0.6)",
                      "rgba(79,70,229,0.4)",
                      "rgba(0,0,0,0.2)",
                    ]
                  : [
                      "rgba(255,255,255,0.06)",
                      "rgba(255,255,255,0.02)",
                    ]
              }
              className={`rounded-3xl border py-5 ${
                isReady
                  ? "border-purple-300/30"
                  : "border-white/10"
              }`}
            >
              {/* ✨ TOP LIGHT */}
              <View className="absolute left-6 right-6 top-0 h-[1px] bg-white/30" />

              <View className="items-center px-5">
                <Text
                  className={`font-main-bold text-[16px] tracking-wide ${
                    isReady ? "text-white" : "text-white/40"
                  }`}
                >
                  {buttonText}
                </Text>

                <Text
                  className={`mt-1 text-center text-[11px] ${
                    isReady ? "text-white/70" : "text-white/30"
                  }`}
                >
                  {buttonHint}
                </Text>
              </View>
            </LinearGradient>
          </MotiView>
        )}
      </Pressable>
    </View>
  );
};