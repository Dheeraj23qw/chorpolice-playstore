import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";

import { Text } from "@/components/Text";
import { LobbyState } from "./types";

interface RoomSummaryCardProps {
  lobby: LobbyState;
}

export const RoomSummaryCard: React.FC<RoomSummaryCardProps> = ({ lobby }) => {
  const joinedCount = lobby.players.filter((player) => !player.isBot).length;
  const openSeats = Math.max(0, lobby.maxPlayers - joinedCount);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 100 }}
      className="mb-5 overflow-hidden rounded-[28px]"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        className="rounded-[28px] border border-white/10 p-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
            Room Story
          </Text>
          <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-white/65">
              {lobby.isHost ? "Host" : "Player"}
            </Text>
          </View>
        </View>

        <Text className="mt-3 font-main-bold text-xl text-white">
          {openSeats === 0
            ? "Everybody is ready"
            : `${openSeats} seat${openSeats === 1 ? "" : "s"} still open`}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-white/60">
          {lobby.isHost
            ? "Tap Let's Go when you want to move everyone to the final setup screen."
            : "Wait here. The host will move everyone to the final setup screen."}
        </Text>
        <View className="mt-4 flex-row items-center gap-2">
            <View className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                <MotiView 
                    from={{ width: "0%" }}
                    animate={{ width: `${(joinedCount / lobby.maxPlayers) * 100}%` }}
                    className="h-full bg-blue-500"
                />
            </View>
            <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
                {joinedCount} / {lobby.maxPlayers}
            </Text>
        </View>
      </LinearGradient>
    </MotiView>
  );
};
