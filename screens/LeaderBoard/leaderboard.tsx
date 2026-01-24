import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { rf, hp, wp } from "@/utils/responsive";

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
  { id: "5", name: "Chris", score: 620 },
];

export default function LeaderboardScreen() {
  return (
    <View className="flex-1 bg-[#09090b] px-6">
      {/* 1. Header Section */}
      <View className="mt-12 mb-8">
        <Text style={{ fontSize: rf(3.5) }} className="text-white font-black italic tracking-tighter">
          LEADERBOARD
        </Text>
        <View className="flex-row items-center mt-2">
          <View className="h-1 w-8 bg-indigo-500 rounded-full mr-2" />
          <Text style={{ fontSize: rf(1.2) }} className="text-white/40 font-bold uppercase tracking-[3px]">
            Season High Scores
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {PLAYERS.map((player, index) => {
          const isWinner = index === 0;
          const isTopThree = index < 3;

          return (
            <TouchableOpacity
              key={player.id}
              activeOpacity={0.8}
              className={`
                mb-4 flex-row items-center rounded-[28px] p-5
                ${isWinner ? 'bg-indigo-600/20 border border-indigo-500/40' : 'bg-white/[0.03] border border-white/10'}
              `}
              style={isWinner ? {
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10
              } : {}}
            >
              {/* 2. Rank Badge with Dynamic Glow */}
              <View 
                className={`w-12 h-12 items-center justify-center rounded-2xl mr-4
                  ${index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-slate-500/50' : index === 2 ? 'bg-orange-500/50' : 'bg-white/5'}
                `}
              >
                <Text 
                   style={{ fontSize: rf(1.8) }} 
                   className={`font-black ${index < 3 ? 'text-white' : 'text-white/30'}`}
                >
                  {index + 1}
                </Text>
              </View>

              {/* 3. Player Identity */}
              <View className="flex-1">
                <Text 
                  style={{ fontSize: rf(2) }} 
                  className={`font-bold tracking-tight ${isWinner ? 'text-white' : 'text-white/80'}`}
                >
                  {player.name}
                </Text>
                <Text style={{ fontSize: rf(1) }} className="text-indigo-400/50 font-black uppercase tracking-widest mt-1">
                  Active Operative
                </Text>
              </View>

              {/* 4. Score with Glass Label */}
              <View className="items-end">
                <Text style={{ fontSize: rf(2.2) }} className="text-white font-black italic">
                  {player.score.toLocaleString()}
                </Text>
                <Text style={{ fontSize: rf(0.8) }} className="text-white/20 uppercase font-bold tracking-tighter">
                  Points Earned
                </Text>
              </View>

              {/* 5. Winner Shine Effect */}
              {isWinner && (
                <View className="absolute top-0 right-0 left-0 h-[1px] bg-white/20 rounded-full mx-8" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}