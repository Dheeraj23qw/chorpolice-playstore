import React from "react";
import { View, Image, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";

export const PlayerListItem = ({
  item,
  index,
  lobby,
  getAvatarSource,
}: any) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      className="mb-4 overflow-hidden rounded-3xl"
    >
      {/* 🔥 Glow Background */}
      <View className="absolute inset-0 rounded-3xl bg-purple-500/10 blur-2xl" />

      {/* 🎯 Glass Card */}
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
        className="flex-row items-center rounded-3xl border border-white/10 p-4"
      >
        {/* 🧑 Avatar */}
        <View className="mr-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            {lobby.isHost ? (
              <Image
                source={getAvatarSource(item.avatarId)}
                className="h-12 w-12 rounded-xl"
              />
            ) : (
              <Ionicons name="globe-outline" size={22} color="white" />
            )}
          </View>
        </View>

        {/* 📄 Info */}
        <View className="flex-1">
          <Text className="font-main-bold text-white">
            {lobby.isHost ? item.name : (item.lobbyName || item.name || item.deviceName)}
          </Text>

          <Text className="mt-1 text-[11px] text-white/40">
            {lobby.isHost ? "Player" : `${item.ip}${item.playerCount ? ` · ${item.playerCount}/4 players` : ""}`}
          </Text>
        </View>

        {/* 🚀 JOIN BUTTON */}
        {!lobby.isHost && (
          <Pressable
            onPress={() => lobby.handleJoin(item)}
            className="overflow-hidden rounded-xl"
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              className="items-center px-4 py-2"
            >
              <Text className="font-main-bold text-xs tracking-wide text-white">
                JOIN
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </LinearGradient>
    </Animated.View>
  );
};
