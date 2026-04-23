import React from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";

export const StartButton = ({ lobby }: any) => {
  const isHostReady = !lobby.isHost || lobby.connectionStatus === "HOSTING";
  const isReady = lobby.players.length === 4 && isHostReady;
  const humanCount = lobby.players.filter((player: any) => !player.isBot).length;
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

  return (
    <View className="absolute bottom-0 w-full px-6 pb-12 pt-10">
      {lobby.isHost ? (
        <Pressable
          disabled={!isReady}
          onPress={() => lobby.setIsBettingModalVisible(true)}
          className="overflow-hidden rounded-3xl"
        >
          {isReady ? (
            <View className="absolute inset-0 rounded-3xl bg-purple-500/15 blur-3xl" />
          ) : null}

          <LinearGradient
            colors={
              isReady
                ? ["rgba(124,58,237,0.55)", "rgba(79,70,229,0.45)"]
                : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
            }
            className={`rounded-3xl border py-5 ${
              isReady ? "border-purple-300/30" : "border-white/10"
            }`}
          >
            <View className="absolute inset-0 rounded-3xl bg-white/5" />

            <View className="items-center px-5">
              <Text
                className={`font-main-bold tracking-wide ${
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
        </Pressable>
      ) : (
        <View className="items-center py-5">
          <Text className="text-center text-white/30">
            Waiting for the host to start the match
          </Text>
        </View>
      )}
    </View>
  );
};
