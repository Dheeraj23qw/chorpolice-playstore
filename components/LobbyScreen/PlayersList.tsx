import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { PlayerListItem } from "./PlayerListItem";
import { LobbyState } from "./types";

interface PlayersListProps {
  lobby: LobbyState;
  getAvatarSource: (avatarId: number) => any;
}

export const PlayersList: React.FC<PlayersListProps> = ({
  lobby,
  getAvatarSource,
}) => {
  // ✅ DEFAULT OPEN
  const [open, setOpen] = useState(true);

  const hasPlayers = lobby.players.length > 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18 }}
      className="mb-6 overflow-hidden rounded-[32px]"
    >
      {/* Glow */}
      <View className="absolute inset-0 rounded-[32px] bg-indigo-500/10 blur-2xl" />

      {/* Card */}
      <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
        {/* HEADER (Dropdown Trigger) */}
        <Pressable
          onPress={() => setOpen((p) => !p)}
          className="flex-row items-center justify-between px-5 py-4"
        >
          <View>
            <Text className="text-[10px] uppercase tracking-[3px] text-white/40">
              Players
            </Text>

            <View className="mt-1 flex-row items-center gap-2">
              <Text className="font-main-bold text-white">
                {lobby.isHost ? `${lobby.players.length} Connected` : "Active Players"}
              </Text>

              {/* status dot */}
              <View className="h-2 w-2 rounded-full bg-green-400 opacity-80" />
            </View>
          </View>

          {/* animated chevron */}
          <MotiView
            animate={{ rotate: open ? "180deg" : "0deg" }}
            transition={{ type: "timing", duration: 200 }}
          >
            <Ionicons name="chevron-down" size={18} color="white" />
          </MotiView>
        </Pressable>

        {/* DROPDOWN CONTENT */}
        <AnimatePresence>
          {open && (
            <MotiView
              key="dropdown"
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: 180 }}
              className="overflow-hidden px-4 pb-4"
            >
              {hasPlayers ? (
                <View>
                  {lobby.players.map((item, index) => (
                    <PlayerListItem
                      key={item.id}
                      item={item}
                      index={index}
                      lobby={lobby}
                      getAvatarSource={getAvatarSource}
                    />
                  ))}
                </View>
              ) : (
                <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <Text className="font-main-bold text-white">
                    Waiting for players
                  </Text>

                  <Text className="mt-2 text-sm text-white/60">
                    Players will appear here automatically.
                  </Text>
                </View>
              )}
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </MotiView>
  );
};
