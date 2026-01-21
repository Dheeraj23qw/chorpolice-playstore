import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import { Coins, Trophy, Lock, RotateCcw } from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";

type RewardTier = {
  id: number;
  coinsRequired: number;
  reward: string;
  emoji: string;
};

const REWARD_TIERS: RewardTier[] = [
  { id: 1, coinsRequired: 2_500_000, reward: "Badminton ", emoji: "🏸" },
  { id: 2, coinsRequired: 6_000_000, reward: "Cricket Kit", emoji: "🏏" },
  { id: 3, coinsRequired: 10_000_000, reward: "₹1,000 Cash", emoji: "💰" },
];

export default function EarnScreen() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.72, 300);

  const [coins, setCoins] = useState(720_000);
  const [spunToday, setSpunToday] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const spinWheel = () => {
    if (spunToday) return;

    const win = Math.random() > 0.5;

    if (win) {
      setCoins((c) => c + 1000);
      setSpinResult("🎉 You Won +1000 Coins!");
    } else {
      setCoins((c) => Math.max(0, c - 500));
      setSpinResult("😢 You Lost -500 Coins");
    }

    setSpunToday(true);
  };

  return (
    <ScreenWrapper title="Earn Rewards" subtitle="Play • Spin • Win">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= Wallet ================= */}
        <View className="mb-6 rounded-3xl bg-indigo-600 p-6 shadow-xl">
          <Text className="text-xs uppercase tracking-widest text-indigo-200">
            Your Coins
          </Text>

          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-3xl font-black text-white">
              {coins.toLocaleString()} 🪙
            </Text>

            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Coins size={28} color="white" />
            </View>
          </View>

          <Text className="mt-3 text-sm text-indigo-100">
            Reach milestones and unlock real-world rewards 🎁
          </Text>
        </View>

        {/* ================= Reward Cards ================= */}
        <Text className="mb-3 text-lg font-black text-slate-900">
          🎯 Reward Targets
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {REWARD_TIERS.map((tier) => {
            const unlocked = coins >= tier.coinsRequired;
            const progress = Math.min(
              (coins / tier.coinsRequired) * 100,
              100
            );

            return (
              <View
                key={tier.id}
                style={{ width: CARD_WIDTH }}
                className="mr-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-md"
              >
                {/* Icon */}
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-4xl">{tier.emoji}</Text>
                  {unlocked ? (
                    <Trophy size={22} color="#16a34a" />
                  ) : (
                    <Lock size={20} color="#94a3b8" />
                  )}
                </View>

                <Text className="text-lg font-black text-slate-900">
                  {tier.reward}
                </Text>

                <Text className="mt-1 text-xs text-slate-500">
                  Target: {tier.coinsRequired.toLocaleString()} coins
                </Text>

                {/* Progress */}
                <View className="mt-4">
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-[10px] uppercase text-slate-400">
                      Progress
                    </Text>
                    <Text className="text-[10px] text-slate-400">
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  <View className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <View
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${
                        unlocked ? "bg-emerald-500" : "bg-indigo-500"
                      }`}
                    />
                  </View>
                </View>

                {unlocked && (
                  <View className="mt-3 rounded-full bg-emerald-100 px-3 py-1 self-start">
                    <Text className="text-[10px] font-bold text-emerald-700">
                      READY TO CLAIM
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* ================= Daily Spin Wheel ================= */}
        <Text className="mt-8 mb-3 text-lg font-black text-slate-900">
          🎡 Daily Spin
        </Text>

        <View className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100">
          {/* Wheel */}
          <View className="items-center">
            <View className="h-40 w-40 items-center justify-center rounded-full border-8 border-indigo-500 bg-indigo-100">
              <RotateCcw size={40} color="#4f46e5" />
            </View>

            <Text className="mt-4 text-sm text-slate-600 text-center">
              Spin once per day  
              <Text className="font-bold"> Win +1000 🪙 | Lose -500 🪙</Text>
            </Text>
          </View>

          {/* Result */}
          {spinResult && (
            <View className="mt-4 rounded-xl bg-slate-100 py-2">
              <Text className="text-center font-bold text-slate-700">
                {spinResult}
              </Text>
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            disabled={spunToday}
            onPress={spinWheel}
            activeOpacity={0.8}
            className={`mt-5 rounded-2xl py-3 ${
              spunToday ? "bg-slate-300" : "bg-indigo-600"
            }`}
          >
            <Text className="text-center font-bold text-white">
              {spunToday ? "Come Back Tomorrow" : "Spin Now"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-16" />
      </ScrollView>
    </ScreenWrapper>
  );
}
