import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import  ScreenWrapper  from '@/components/screenwrapper';

type Player = {
  id: string;
  name: string;
  score: number;
};

const PLAYERS: Player[] = [
  { id: "1", name: "Alex", score: 980 },
  { id: "2", name: "Jordan", score: 920 },
  { id: "3", name: "Maya", score: 880 },
  { id: "4", name: "Sam", score: 750 },
];

export default function LeaderboardScreen({ navigation }: any) {
  return (
    <ScreenWrapper title="Leaderboard" navigation={navigation}>
      {/* Subheader / Description */}
      <View className="mb-6">
        <Text className="text-slate-500 text-sm">
          Showing the top performers for the current season.
        </Text>
      </View>

      {/* Players List */}
      {PLAYERS.map((player, index) => {
        const isTopThree = index < 3;
        const rankColor = index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-orange-400" : "text-slate-400";

        return (
          <TouchableOpacity
            key={player.id}
            activeOpacity={0.7}
            className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-slate-100"
          >
            {/* Rank with Trophy Logic */}
            <View className="w-12 items-center justify-center">
              <Text className={`text-lg font-black ${rankColor}`}>
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
              </Text>
            </View>

            {/* Player Info */}
            <View className="flex-1 ml-2">
              <Text className="text-base font-bold text-slate-800">
                {player.name}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Global Rank
              </Text>
            </View>

            {/* Score Badge */}
            <View className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
              <Text className="text-sm font-black text-indigo-600">
                {player.score.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScreenWrapper>
  );
}