import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Trophy, Lock } from "lucide-react-native";
import { Text } from "@/components/Text";
import { RewardTier } from "@/constants/RewardsConst";
import { getOfferTimeData } from "@/utils/time";
import { Alerts } from "@/utils/alert";

interface MilestoneCardProps {
  tier: RewardTier;
  currentCoins: number;
  cardWidth: number;
  onClaim: (tier: RewardTier) => void;
  installTime: number | null;
  isClaimed: boolean;
}

export const MilestoneCard = ({
  tier,
  currentCoins,
  cardWidth,
  onClaim,
  installTime,
  isClaimed,
}: MilestoneCardProps) => {
  const safeInstallTime = installTime ?? Date.now();

  const [time, setTime] = useState(() =>
    getOfferTimeData(safeInstallTime, tier.durationDays),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getOfferTimeData(safeInstallTime, tier.durationDays));
    }, 1000);

    return () => clearInterval(interval);
  }, [safeInstallTime, tier.durationDays]);

  const { expired, days, hours, minutes, seconds, isEndingSoon } = time;

  const isDead = isClaimed || expired;
  const unlocked = currentCoins >= tier.coinsRequired && !isDead;

  const progress = Math.min((currentCoins / tier.coinsRequired) * 100, 100);

  const formatTime = () => {
    if (expired) return "Expired";
    if (days > 1) return `${days}d left`;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

  /**
   * 🎯 SMART TAP (INFO + UX)
   */
  const handleCardPress = () => {
    if (isClaimed) {
      Alerts.success(
        "Already Claimed",
        `You already unlocked ${tier.reward} 🎉`,
      );
      return;
    }

    if (expired) {
      Alerts.error("Offer Expired", `${tier.reward} is no longer available.`);
      return;
    }

    if (currentCoins < tier.coinsRequired) {
      const remaining = tier.coinsRequired - currentCoins;

      Alerts.error(
        isEndingSoon ? "Hurry Up!" : "Limited Offer",
        isEndingSoon
          ? `Only ${formatTime()} left! Earn ${remaining.toLocaleString()} coins fast!`
          : `You need ${remaining.toLocaleString()} more coins.\nTime left: ${formatTime()}`,
      );
      return;
    }

    // Optional: hint instead of auto-claim
    Alerts.success("Ready to Claim", `You can unlock ${tier.reward} now 🎯`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCardPress}
      style={{ width: cardWidth }}
      className={`mr-5 rounded-[32px] p-6 ${
        isClaimed
          ? "border border-slate-700 bg-slate-800 opacity-60"
          : expired
            ? "border border-red-500/20 bg-slate-900/40 opacity-50"
            : unlocked
              ? "border border-emerald-500/30 bg-slate-900"
              : "border border-white/5 bg-slate-900/70"
      }`}
    >
      {/* 🔝 Top */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
          <Text className="text-3xl">{tier.emoji}</Text>
        </View>

        <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
          {isClaimed ? (
            <Trophy size={16} color="#94a3b8" />
          ) : expired ? (
            <Lock size={16} color="#ef4444" />
          ) : unlocked ? (
            <Trophy size={18} color="#10b981" />
          ) : (
            <Lock size={16} color="#64748b" />
          )}
        </View>
      </View>

      {/* 🎁 Reward */}
      <Text className="font-main-bold text-lg text-white">{tier.reward}</Text>

      {/* ⏳ STATUS BADGE */}
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-[10px] uppercase text-slate-500">
          {isClaimed ? "Completed" : "Limited Offer"}
        </Text>

        <View className="rounded-full border px-3 py-1">
          <Text className="font-main-bold text-[10px] text-slate-300">
            {isClaimed
              ? "✅ Claimed"
              : expired
                ? "❌ Expired"
                : isEndingSoon
                  ? "🔥 " + formatTime()
                  : "⏳ " + formatTime()}
          </Text>
        </View>
      </View>

      {/* 🎯 Goal */}
      <View className="mt-2 flex-row items-center">
        <Text className="text-[10px] uppercase text-slate-500">Goal</Text>
        <Text className="ml-2 font-main-bold text-xs text-indigo-400">
          {tier.coinsRequired.toLocaleString()} 🪙
        </Text>
      </View>

      {/* 📊 Progress */}
      <View className="mt-6">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-[10px] uppercase text-slate-600">Progress</Text>
          <Text className="font-main-bold text-xs text-slate-400">
            {progress.toFixed(0)}%
          </Text>
        </View>

        <View className="h-2 rounded-full bg-black/40">
          <View
            style={{ width: `${progress}%` }}
            className={`h-full ${
              unlocked ? "bg-emerald-500" : "bg-indigo-600"
            }`}
          />
        </View>
      </View>

      {/* 🚀 Claim */}
      {unlocked && !isDead && (
        <TouchableOpacity
          onPress={() => onClaim(tier)}
          className="mt-6 items-center rounded-2xl bg-emerald-500 py-3 active:scale-95"
        >
          <Text className="font-main-bold text-xs uppercase text-white">
            Claim Reward
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
