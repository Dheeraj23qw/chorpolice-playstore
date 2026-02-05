import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { rf, hp, wp } from "@/utils/responsive";
import { Crown, Trophy, Medal, TrendingUp, ChevronRight } from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

type Player = {
  id: string;
  name: string;
  score: number;
};

const PLAYERS: Player[] = [
  { id: "1", name: "Alex Rivera", score: 2980 },
  { id: "2", name: "Jordan Smith", score: 2420 },
  { id: "3", name: "Maya Chen", score: 2180 },
  { id: "4", name: "Sam Wilson", score: 1750 },
  { id: "5", name: "Chris Evans", score: 1620 },
  { id: "6", name: "Luna Love", score: 1400 },
];

export default function LeaderboardScreen() {
  const topThree = PLAYERS.slice(0, 3);
  const remainingPlayers = PLAYERS.slice(3);

  return (
    <ScreenWrapper title="Leaderboard" variant="dark" subtitle="Season 4: Global Ranks">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 pt-4 bg-slate-950 px-5">
        
        {/* ================= 🏆 TOP 3 PODIUM SECTION ================= */}
        <View className="flex-row items-end justify-between mb-10 mt-6 px-2">
          
          {/* Rank 2 */}
          <View className="items-center w-[30%]">
            <View className="relative mb-3">
               <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-slate-800 border-2 border-slate-400/30 shadow-2xl">
                 <Text className="text-2xl">🥈</Text>
               </View>
               <View className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-400 items-center justify-center border-2 border-slate-950">
                 <Text className="text-[10px] font-main-bold text-white">2</Text>
               </View>
            </View>
            <Text numberOfLines={1} className="text-white font-main-bold text-xs">{topThree[1].name}</Text>
            <Text className="text-slate-500 font-main-bold text-[10px] mt-1">{topThree[1].score.toLocaleString()}</Text>
          </View>

          {/* Rank 1 (The King) */}
          <View className="items-center w-[35%]">
            <View className="relative mb-4">
               {/* Glowing Aura */}
               <View className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl" />
               <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-indigo-600 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/50">
                 <Crown size={32} color="white" strokeWidth={2.5} />
               </View>
               <View className="absolute -top-3 -right-2 h-8 w-8 rounded-full bg-amber-500 items-center justify-center border-4 border-slate-950 shadow-lg">
                 <Text className="text-xs font-main-bold text-white">1</Text>
               </View>
            </View>
            <Text numberOfLines={1} className="text-white font-main-bold text-sm tracking-tight">{topThree[0].name}</Text>
            <Text className="text-indigo-400 font-main-bold text-xs mt-1">{topThree[0].score.toLocaleString()}</Text>
          </View>

          {/* Rank 3 */}
          <View className="items-center w-[30%]">
            <View className="relative mb-3">
               <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-slate-800 border-2 border-orange-500/30 shadow-2xl">
                 <Text className="text-2xl">🥉</Text>
               </View>
               <View className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-orange-500 items-center justify-center border-2 border-slate-950">
                 <Text className="text-[10px] font-main-bold text-white">3</Text>
               </View>
            </View>
            <Text numberOfLines={1} className="text-white font-main-bold text-xs">{topThree[2].name}</Text>
            <Text className="text-slate-500 font-main-bold text-[10px] mt-1">{topThree[2].score.toLocaleString()}</Text>
          </View>
        </View>

        {/* ================= 📊 REMAINING LIST ================= */}
        <View className="space-y-3">
          <Text className="px-2 text-[10px] font-main-bold text-slate-500 uppercase tracking-[2px] mb-2">
            Regional Contenders
          </Text>

          {remainingPlayers.map((player, index) => (
            <TouchableOpacity
              key={player.id}
              activeOpacity={0.8}
              className="flex-row items-center rounded-[24px] bg-slate-900/50 p-4 border border-white/5"
            >
              {/* Rank Index */}
              <View className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800 mr-4">
                <Text className="text-slate-500 font-main-bold text-xs">{index + 4}</Text>
              </View>

              {/* Player Info */}
              <View className="flex-1">
                <Text className="text-white font-main-bold text-sm">{player.name}</Text>
                <View className="flex-row items-center mt-1">
                  <TrendingUp size={10} color="#10b981" />
                  <Text className="text-[10px] text-emerald-500 font-main-md ml-1">+12 pos</Text>
                </View>
              </View>

              {/* Score */}
              <View className="items-end mr-2">
                <Text className="text-white font-main-bold text-sm">
                  {player.score.toLocaleString()}
                </Text>
                <Text className="text-[9px] text-slate-600 font-main-bold uppercase tracking-tighter">
                  PTS
                </Text>
              </View>
              
              <ChevronRight size={14} color="#334155" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= 👤 CURRENT USER POSITION (STICKY FEEL) ================= */}
        <View className="mt-10 rounded-[32px] bg-indigo-600/10 border border-indigo-500/20 p-6 flex-row items-center">
             <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
                <Text className="text-white font-main-bold text-lg">14</Text>
             </View>
             <View className="ml-4 flex-1">
                <Text className="text-white font-main-bold text-base">You (Alex Rivera)</Text>
                <Text className="text-indigo-400 text-xs font-main-md">Top 5% of this season</Text>
             </View>
             <TouchableOpacity className="bg-white/10 px-4 py-2 rounded-xl">
                <Text className="text-white text-[10px] font-main-bold uppercase tracking-wider">Details</Text>
             </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}