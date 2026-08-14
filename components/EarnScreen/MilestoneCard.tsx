import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { Trophy, Lock, CheckCircle2, Flame } from "lucide-react-native";
import { Text } from "@/components/Text";
import { RewardTier } from "@/constants/RewardsConst";
import { getOfferTimeData } from "@/utils/time";
import { Alerts } from "@/utils/alert";
import { formatCompactNumber } from "@/utils/formatCompactNumber";

const ICON_MAP: Record<string, any> = {
  Coins: Trophy,
  Shield: Trophy,
  Trophy: Trophy,
  Crown: Trophy,
  Gem: Trophy,
  Vault: Trophy,
  Flame: Flame,
  Star: Trophy,
};

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
          ? `Only ${formatTime()} left! Earn ${formatCompactNumber(remaining)} coins fast!`
          : `You need ${formatCompactNumber(remaining)} more coins.\nTime left: ${formatTime()}`,
      );
      return;
    }

    Alerts.success("Ready to Claim", `You can unlock ${tier.reward} now 🎯`);
  };

  const IconComponent = ICON_MAP[tier.icon] || Trophy;

  const statusConfig = isClaimed
    ? { label: "CLAIMED", color: "#94a3b8", bg: "bg-slate-500/20", border: "border-slate-500/30", icon: CheckCircle2 }
    : expired
    ? { label: "EXPIRED", color: "#ef4444", bg: "bg-red-500/20", border: "border-red-500/30", icon: Lock }
    : unlocked
    ? { label: "UNLOCKED", color: "#10b981", bg: "bg-emerald-500/20", border: "border-emerald-500/30", icon: Trophy }
    : { label: formatTime(), color: "#818cf8", bg: "bg-indigo-500/20", border: "border-indigo-500/30", icon: Lock };

  const StatusIcon = statusConfig.icon;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 16, delay: tier.id * 50 }}
      style={{ width: cardWidth }}
      className="mr-5"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCardPress}
        className="relative overflow-hidden rounded-[32px] border-2 p-6"
        style={{
          borderColor: isClaimed
            ? "rgba(148,163,184,0.2)"
            : expired
            ? "rgba(239,68,68,0.2)"
            : unlocked
            ? "rgba(16,185,129,0.4)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: isClaimed
            ? "rgba(15,23,42,0.6)"
            : expired
            ? "rgba(15,23,42,0.4)"
            : "rgba(15,23,42,0.9)",
          shadowColor: unlocked ? "#10b981" : "#6366f1",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: unlocked ? 0.3 : 0.15,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {/* Animated Background Glow */}
        {!isDead && (
          <MotiView
            from={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            transition={{
              loop: true,
              duration: 3000,
              type: "timing",
            }}
            className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: unlocked ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.3)" }}
          />
        )}

        {/* Top Section */}
        <View className="mb-5 flex-row items-center justify-between">
          <View className="h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/5">
            <Text className="text-3xl">{tier.emoji}</Text>
          </View>

          <View className={`h-10 w-10 items-center justify-center rounded-2xl border ${unlocked && !isDead ? "border-emerald-400/30 bg-emerald-500/20" : "border-white/10 bg-white/5"}`}>
            {isClaimed ? (
              <CheckCircle2 size={18} color="#94a3b8" />
            ) : expired ? (
              <Lock size={18} color="#ef4444" />
            ) : unlocked ? (
              <Trophy size={20} color="#10b981" />
            ) : (
              <Lock size={16} color="#64748b" />
            )}
          </View>
        </View>

        {/* Reward Info */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] font-main-bold uppercase tracking-[3px] text-indigo-400/60">
              Unlock Reward
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs">🪙</Text>
              <Text className="font-main-bold text-xs text-emerald-400">
                +{formatCompactNumber(tier.rewardCoins)}
              </Text>
            </View>
          </View>
          <Text className="font-main-bold text-xl text-white leading-tight">{tier.reward}</Text>
        </View>

        {/* Progress Section */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-[10px] uppercase tracking-widest text-slate-500">Progress</Text>
            <Text className="font-main-bold text-xs text-slate-400">
              {progress.toFixed(0)}%
            </Text>
          </View>
          <View className="h-2 rounded-full bg-black/40 overflow-hidden">
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "timing", duration: 800 }}
              className={`h-full rounded-full ${unlocked ? "bg-emerald-500" : "bg-indigo-600"}`}
              style={{ shadowColor: unlocked ? "#10b981" : "#6366f1", shadowRadius: 8 }}
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center">
              <Text className="mr-1 text-xs">🪙</Text>
              <Text className="font-main-bold text-xs text-indigo-300">
                {formatCompactNumber(tier.coinsRequired)}
              </Text>
            </View>
            <Text className="text-[10px] text-slate-500">
              {Math.round(progress)}% complete
            </Text>
          </View>
        </View>

        {/* Status Badge / Claim Button */}
        {unlocked && !isDead ? (
          <MotiView
            from={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{
              loop: true,
              duration: 2000,
              type: "timing",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClaim(tier);
              }}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 active:opacity-80"
              style={{ shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
            >
              <Trophy size={16} color="white" />
              <Text className="font-main-bold text-xs uppercase tracking-[2px] text-white">
                Claim Reward
              </Text>
            </TouchableOpacity>
          </MotiView>
        ) : (
          <View className={`flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3 ${statusConfig.bg} ${statusConfig.border}`}>
            <StatusIcon size={14} color={statusConfig.color} />
            <Text className="font-main-bold text-[10px] uppercase tracking-[2px]" style={{ color: statusConfig.color }}>
              {statusConfig.label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};
