import React from "react";
import { Image, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";

export const PlayerListItem = ({
  item,
  index,
  lobby,
  getAvatarSource,
}: any) => {
  const isBot = Boolean(item.isBot);
  const isLocalPlayer = item.id === lobby.localPlayerId;
  const isHostSlot = index === 0;
  const accentColors: [string, string] = isBot
    ? ["rgba(14,165,233,0.16)", "rgba(14,165,233,0.04)"]
    : isHostSlot
      ? ["rgba(245,158,11,0.18)", "rgba(245,158,11,0.04)"]
      : ["rgba(124,58,237,0.16)", "rgba(124,58,237,0.04)"];
  const subtitle = isBot
    ? "Open seat ready for a friend to join"
    : isHostSlot
      ? "Room owner"
      : "Connected player";

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify()}
      className="mb-4 overflow-hidden rounded-3xl"
    >
      <View className="absolute inset-0 rounded-3xl bg-purple-500/10 blur-2xl" />

      <LinearGradient
        colors={accentColors}
        className="flex-row items-center rounded-3xl border border-white/10 p-4"
      >
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Image
            source={getAvatarSource(item.avatarId)}
            className="h-12 w-12 rounded-xl"
          />
        </View>

        <View className="flex-1">
          <Text className="font-main-bold text-white">{item.name}</Text>
          <Text className="mt-1 text-[11px] text-white/45">{subtitle}</Text>
          <Text className="mt-1 text-[10px] uppercase tracking-[2px] text-white/30">
            Slot {index + 1} of {lobby.maxPlayers}
          </Text>
        </View>

        <View className="items-end gap-2">
          {isHostSlot ? (
            <View className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1">
              <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-amber-200">
                Host
              </Text>
            </View>
          ) : null}
          {isLocalPlayer ? (
            <View className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1">
              <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-emerald-200">
                You
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
