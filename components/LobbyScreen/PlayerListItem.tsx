import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, View, Pressable } from "react-native";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { LobbyPlayer, LobbyState } from "./types";

interface PlayerListItemProps {
  item: LobbyPlayer;
  index: number;
  lobby: LobbyState;
  getAvatarSource: (avatarId: number) => any;
}

export const PlayerListItem: React.FC<PlayerListItemProps> = ({
  item,
  index,
  lobby,
  getAvatarSource,
}) => {
  const isBot = Boolean(item.isBot);
  const isLocalPlayer = item.id === lobby.localPlayerId;
  const isHostSlot = index === 0;

  const accentColors: [string, string] = isBot
    ? ["rgba(14,165,233,0.16)", "rgba(14,165,233,0.04)"]
    : isHostSlot
      ? ["rgba(245,158,11,0.18)", "rgba(245,158,11,0.04)"]
      : ["rgba(124,58,237,0.16)", "rgba(124,58,237,0.04)"];

  const subtitle = isBot
    ? "Chor Police Player"
    : isHostSlot
      ? "Room owner"
      : "Connected player";

  return (
    <Pressable>
      {({ pressed }) => (
        <MotiView
          from={{ opacity: 0, translateY: 20, scale: 0.96 }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: pressed ? 0.98 : 1,
          }}
          transition={{
            delay: index * 80,
            type: "spring",
            damping: 16,
            stiffness: 180,
          }}
          className="mb-4 overflow-hidden rounded-3xl"
        >
          {/* 🔥 GLOW (reduced, cleaner) */}
          <View className="absolute inset-0 rounded-3xl bg-purple-500/10 blur-xl" />

          <LinearGradient
            colors={accentColors}
            className="flex-row items-center rounded-3xl border border-white/10 p-4"
          >
            {/* AVATAR */}
            <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Image
                source={getAvatarSource(item.avatarId)}
                className="h-12 w-12 rounded-xl"
              />
            </View>

            {/* INFO */}
            <View className="flex-1">
              <Text className="font-main-bold text-white">{item.name}</Text>

              <Text className="mt-1 text-[11px] text-white/45">{subtitle}</Text>
            </View>

            {/* TAGS */}
            <View className="items-end gap-2">
              {isHostSlot && (
                <View className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1">
                  <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-amber-200">
                    Host
                  </Text>
                </View>
              )}

              {isLocalPlayer && (
                <View className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1">
                  <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-emerald-200">
                    You
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </MotiView>
      )}
    </Pressable>
  );
};
