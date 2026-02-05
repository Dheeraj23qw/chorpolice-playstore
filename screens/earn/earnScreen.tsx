import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import { Coins, Trophy, Lock, RotateCcw, ChevronRight, Gift, Zap, History } from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

type RewardTier = {
  id: number;
  coinsRequired: number;
  reward: string;
  emoji: string;
};

const REWARD_TIERS: RewardTier[] = [
  { id: 1, coinsRequired: 2_500_000, reward: "Badminton Pro", emoji: "🏸" },
  { id: 2, coinsRequired: 6_000_000, reward: "Cricket Elite Kit", emoji: "🏏" },
  { id: 3, coinsRequired: 10_000_000, reward: "₹1,000 Cash", emoji: "💰" },
];

export default function EarnScreen() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.78, 300);

  const [coins, setCoins] = useState(720_000);
  const [spunToday, setSpunToday] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const spinWheel = () => {
    if (spunToday) return;
    const win = Math.random() > 0.5;
    if (win) {
      setCoins((c) => c + 1000);
      setSpinResult("🎉 +1,000 Coins added!");
    } else {
      setCoins((c) => Math.max(0, c - 500));
      setSpinResult("💔 Better luck next time!");
    }
    setSpunToday(true);
  };

  return (
    <ScreenWrapper 
      title="Rewards Hub" 
      variant="dark" 
      subtitle="Convert your effort into prizes"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-12 pt-4 px-5 bg-slate-950">
        
        {/* ================= 💎 Premium Glass Wallet ================= */}
        <View className="relative overflow-hidden mb-10 rounded-[40px] bg-indigo-600 p-8 shadow-2xl shadow-indigo-500/30">
          {/* Decorative Orbs */}
          <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <View className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-indigo-400/20" />
          
          <View className="flex-row items-start justify-between">
            <View>
              <View className="flex-row items-center space-x-2 mb-1">
                <Zap size={14} color="#c7d2fe" fill="#c7d2fe" />
                <Text className="text-[10px] uppercase font-main-bold tracking-[2px] text-indigo-100">
                  Available Balance
                </Text>
              </View>
              <View className="flex-row items-baseline">
                <Text style={{ fontSize: rf(4) }} className="font-main-bold text-white">
                  {coins.toLocaleString()}
                </Text>
                <Text className="ml-2 text-xl font-main-bold text-indigo-200 tracking-tighter">🪙</Text>
              </View>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20 border border-white/30">
              <Coins size={28} color="white" strokeWidth={2} />
            </View>
          </View>

          <TouchableOpacity className="mt-8 flex-row items-center justify-center rounded-2xl bg-black/20 py-4 border border-white/10 active:scale-95">
            <History size={16} color="white" className="mr-2" />
            <Text className="text-xs font-main-bold text-white uppercase tracking-wider">Transaction History</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 🎯 Reward Milestones ================= */}
        <View className="flex-row items-center justify-between mb-5 px-1">
          <Text className="text-xl font-main-bold text-white tracking-tight">Milestones</Text>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-slate-800">
            <Gift size={16} color="#818cf8" />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="-mx-5" 
          contentContainerClassName="px-5"
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
        >
          {REWARD_TIERS.map((tier) => {
            const unlocked = coins >= tier.coinsRequired;
            const progress = Math.min((coins / tier.coinsRequired) * 100, 100);

            return (
              <View
                key={tier.id}
                style={{ width: CARD_WIDTH }}
                className={`mr-5 rounded-[40px] border p-7 shadow-2xl ${
                  unlocked ? 'bg-slate-900 border-emerald-500/20' : 'bg-slate-900/60 border-white/5'
                }`}
              >
                <View className="mb-6 flex-row items-center justify-between">
                  <View className="h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 border border-slate-700 shadow-sm">
                    <Text className="text-4xl">{tier.emoji}</Text>
                  </View>
                  <View className={`h-11 w-11 items-center justify-center rounded-2xl border ${
                    unlocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-white/5'
                  }`}>
                    {unlocked ? <Trophy size={20} color="#10b981" /> : <Lock size={18} color="#475569" />}
                  </View>
                </View>

                <Text className="text-xl font-main-bold text-white leading-tight">
                  {tier.reward}
                </Text>

                <View className="mt-2 flex-row items-center">
                   <Text className="text-[10px] font-main-bold text-slate-500 uppercase tracking-widest">Goal:</Text>
                   <Text className="ml-2 text-xs font-main-bold text-indigo-400">{tier.coinsRequired.toLocaleString()} 🪙</Text>
                </View>

                {/* Progress Bar Container */}
                <View className="mt-8">
                  <View className="mb-3 flex-row justify-between items-center px-1">
                    <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-slate-600">Sync</Text>
                    <Text className={`text-xs font-main-bold ${unlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  <View className="h-2.5 overflow-hidden rounded-full bg-black/40">
                    <View
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${
                        unlocked ? "bg-emerald-500 shadow-lg shadow-emerald-500" : "bg-indigo-600"
                      }`}
                    />
                  </View>
                </View>

                {unlocked && (
                  <TouchableOpacity className="mt-8 w-full items-center justify-center rounded-3xl bg-emerald-500 py-4 shadow-xl shadow-emerald-500/20 active:scale-95">
                    <Text className="text-xs font-main-bold text-white uppercase tracking-widest">Claim Reward</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* ================= 🎡 Elite Spin Wheel ================= */}
        <View className="mt-12 mb-5 px-1 flex-row items-center justify-between">
          <Text className="text-xl font-main-bold text-white tracking-tight">Daily Fortune</Text>
          <RotateCcw size={18} color="#475569" />
        </View>

        <View className="rounded-[40px] bg-slate-900 border border-white/5 p-8 shadow-inner">
          <View className="items-center">
            {/* The Wheel Visual */}
            <View className="relative h-52 w-52 items-center justify-center">
                {/* Outer Ring Glow */}
                <View className="absolute inset-0 rounded-full bg-indigo-500/10 blur-2xl" />
                <View className="h-52 w-52 items-center justify-center rounded-full border border-slate-800 bg-slate-950 p-3 shadow-2xl">
                    <View className="h-full w-full items-center justify-center rounded-full border-2 border-dashed border-indigo-500/30 bg-slate-900">
                        <RotateCcw size={48} color="#818cf8" strokeWidth={1} />
                    </View>
                </View>
                {/* Pointer Indicator */}
                <View className="absolute -top-1 items-center">
                    <View className="h-6 w-1 bg-indigo-500 rounded-full" />
                    <View className="h-3 w-3 bg-indigo-500 rounded-full -mt-1 shadow-lg shadow-indigo-500" />
                </View>
            </View>

            <Text className="mt-8 text-xs font-main-md text-slate-500 text-center leading-5 px-4">
              Return in <Text className="text-white font-main-bold">24:00:00</Text> to claim your daily luck.{"\n"}
              Potential win: <Text className="text-emerald-400 font-main-bold">+1,000</Text> 🪙
            </Text>
          </View>

          {spinResult && (
            <View className={`mt-8 rounded-3xl py-5 border ${
              spinResult.includes('🎉') ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <Text className={`text-center font-main-bold text-sm ${
                spinResult.includes('🎉') ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {spinResult}
              </Text>
            </View>
          )}

          <TouchableOpacity
            disabled={spunToday}
            onPress={spinWheel}
            activeOpacity={0.8}
            className={`mt-8 rounded-[28px] py-5 items-center justify-center shadow-2xl ${
              spunToday ? "bg-slate-800" : "bg-indigo-600 shadow-indigo-600/40"
            }`}
          >
            <Text className={`font-main-bold text-sm uppercase tracking-widest ${
              spunToday ? 'text-slate-600' : 'text-white'
            }`}>
              {spunToday ? "Try Again Tomorrow" : "Spin and Win"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}