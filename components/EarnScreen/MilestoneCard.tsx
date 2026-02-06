import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Trophy, Lock } from "lucide-react-native";
import { Text } from "@/components/Text";

interface MilestoneCardProps {
  tier: {
    id: number;
    coinsRequired: number;
    reward: string;
    emoji: string;
  };
  currentCoins: number;
  cardWidth: number;
  onClaim: (reward: string, cost: number) => void;
}

export const MilestoneCard = ({
  tier,
  currentCoins,
  cardWidth,
  onClaim,
}: MilestoneCardProps) => {
  const unlocked = currentCoins >= tier.coinsRequired;
  const progress = Math.min((currentCoins / tier.coinsRequired) * 100, 100);

  return (
    <View
      style={{ width: cardWidth }}
      className={`mr-5 rounded-[40px] border p-7 shadow-2xl ${
        unlocked
          ? "bg-slate-900 border-emerald-500/20"
          : "bg-slate-900/60 border-white/5"
      }`}
    >
      {/* Top Section: Emoji and Status Icon */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 border border-slate-700 shadow-sm">
          <Text className="text-4xl">{tier.emoji}</Text>
        </View>
        
        {/* FIXED: Removed the Button from here and restored the Icon */}
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl border ${
            unlocked
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-slate-800 border-white/5"
          }`}
        >
          {unlocked ? (
            <Trophy size={20} color="#10b981" />
          ) : (
            <Lock size={18} color="#475569" />
          )}
        </View>
      </View>

      <Text className="text-xl font-main-bold text-white leading-tight">
        {tier.reward}
      </Text>

      <View className="mt-2 flex-row items-center">
        <Text className="text-[10px] font-main-bold text-slate-500 uppercase tracking-widest">
          Goal:
        </Text>
        <Text className="ml-2 text-xs font-main-bold text-indigo-400">
          {tier.coinsRequired.toLocaleString()} 🪙
        </Text>
      </View>

      {/* Progress Section */}
      <View className="mt-8">
        <View className="mb-3 flex-row justify-between items-center px-1">
          <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-slate-600">
            Sync
          </Text>
          <Text
            className={`text-xs font-main-bold ${unlocked ? "text-emerald-400" : "text-slate-400"}`}
          >
            {progress.toFixed(0)}%
          </Text>
        </View>

        <View className="h-2.5 overflow-hidden rounded-full bg-black/40">
          <View
            style={{ width: `${progress}%` }}
            className={`h-full rounded-full ${
              unlocked
                ? "bg-emerald-500 shadow-lg shadow-emerald-500"
                : "bg-indigo-600"
            }`}
          />
        </View>
      </View>

      {/* FIXED: The Claim button is now correctly placed at the bottom only */}
      {unlocked && (
        <TouchableOpacity 
          onPress={() => onClaim(tier.reward, tier.coinsRequired)}
          className="mt-8 w-full items-center justify-center rounded-3xl bg-emerald-500 py-4 shadow-xl shadow-emerald-500/20 active:scale-95"
        >
          <Text className="text-xs font-main-bold text-white uppercase tracking-widest">
            Claim Reward
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};