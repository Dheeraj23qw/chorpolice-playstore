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
      style={[
        { width: cardWidth },
        unlocked && !isDead
          ? {
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }
          : !isDead
          ? {
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 5,
            }
          : {}
      ]}
      className={`relative mr-5 overflow-hidden rounded-[40px] border-2 p-7 ${
        isClaimed
          ? "border-slate-800 bg-slate-900/60 opacity-60"
          : expired
          ? "border-red-900/30 bg-slate-900/40 opacity-50"
          : unlocked
          ? "border-emerald-500/40 bg-slate-900"
          : "border-white/10 bg-slate-900"
      }`}
    >
      {/* Background Glows */}
      {!isDead && (
        <>
          <View className={`absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-3xl opacity-20 ${unlocked ? "bg-emerald-500" : "bg-indigo-500"}`} />
          <View className={`absolute -left-10 -top-10 h-32 w-32 rounded-full blur-2xl opacity-10 ${unlocked ? "bg-green-400" : "bg-blue-400"}`} />
        </>
      )}

      {/* 🔝 Top */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/5">
          <Text className="text-3xl">{tier.emoji}</Text>
        </View>

        <View className={`h-10 w-10 items-center justify-center rounded-2xl ${unlocked && !isDead ? "bg-emerald-500/20" : "bg-white/5"}`}>
          {isClaimed ? (
            <Trophy size={16} color="#94a3b8" />
          ) : expired ? (
            <Lock size={16} color="#ef4444" />
          ) : unlocked ? (
            <Trophy size={20} color="#10b981" />
          ) : (
            <Lock size={16} color="#64748b" />
          )}
        </View>
      </View>

      {/* 🎁 Reward */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] font-main-bold uppercase tracking-[3px] text-indigo-400/60">
            Unlock Reward
          </Text>
          <Text className="font-main-bold text-xs text-emerald-400">
            + {tier.rewardCoins.toLocaleString()} 🪙
          </Text>
        </View>
        <Text className="font-main-bold text-xl text-white leading-tight mt-1">{tier.reward}</Text>
      </View>

      {/* 🎯 Goal */}
      <View className="flex-row items-center justify-between rounded-2xl bg-black/40 p-3 border border-white/5">
        <View className="flex-row items-center">
           <Text className="mr-1.5 text-xs">🪙</Text>
           <Text className="font-main-bold text-sm text-indigo-300">
             {tier.coinsRequired.toLocaleString()}
           </Text>
        </View>
        <View className="rounded-lg bg-indigo-500/10 px-2 py-1">
          <Text className="font-main-bold text-[9px] text-indigo-300">
            {isClaimed ? "CLAIMED" : expired ? "EXPIRED" : formatTime()}
          </Text>
        </View>
      </View>

      {/* 📊 Progress */}
      <View className="mt-6">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-[10px] uppercase tracking-widest text-slate-500">Progress</Text>
          <Text className="font-main-bold text-xs text-slate-400">
            {progress.toFixed(0)}%
          </Text>
        </View>

        <View className="h-2 rounded-full bg-black/40 overflow-hidden">
          <View
            style={{ width: `${progress}%` }}
            className={`h-full ${
              unlocked ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-indigo-600 shadow-[0_0_8px_#6366f1]"
            }`}
          />
        </View>
      </View>

      {/* 🚀 Claim */}
      {unlocked && !isDead && (
        <TouchableOpacity
          onPress={() => onClaim(tier)}
          className="mt-6 items-center rounded-2xl bg-emerald-500 py-3 shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:scale-95"
        >
          <Text className="font-main-bold text-[11px] uppercase tracking-widest text-white">
            Claim Reward
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
