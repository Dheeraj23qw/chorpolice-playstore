import React from "react";
import { View } from "react-native";
import { MotiView, AnimatePresence } from "moti";

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
  const hasPlayers = lobby.players.length > 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18 }}
      className="mb-6 overflow-hidden rounded-[32px]"
    >
      {/* 🔥 OUTER GLOW */}
      <View className="absolute inset-0 rounded-[32px] bg-indigo-500/10 blur-2xl" />

      {/* 🌫 GLASS CONTAINER */}
      <View className="rounded-[32px] border border-white/10 bg-white/5 p-4">
        {/* 🧠 HEADER (adds structure) */}
        <Text className="mb-3 text-[10px] uppercase tracking-[3px] text-white/40">
          Players Lobby
        </Text>

        <AnimatePresence>
          {hasPlayers ? (
            <MotiView
              key="players"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {lobby.players.map((item, index) => (
                <PlayerListItem
                  key={item.id}
                  item={item}
                  index={index}
                  lobby={lobby}
                  getAvatarSource={getAvatarSource}
                />
              ))}
            </MotiView>
          ) : (
            <MotiView
              key="empty"
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 300 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <Text className="font-main-bold text-white">
                Getting the room ready
              </Text>

              <Text className="mt-2 text-sm text-white/60">
                Players joining will appear here automatically.
              </Text>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </MotiView>
  );
};
