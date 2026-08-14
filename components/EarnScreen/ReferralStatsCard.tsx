import React, { useState } from "react";
import { View, TouchableOpacity, Clipboard } from "react-native";
import { Users, Gift, Copy, Check, Share2 } from "lucide-react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { useSelector } from "react-redux";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { loadReferralStats } from "@/storage/referralStatsStorage";
import { handleShare } from "@/utils/share";
import { generateNumericCode } from "@/utils/referral";
import { formatCompactNumber } from "@/utils/formatCompactNumber";
import { RootState } from "@/redux/store";

export const ReferralStatsCard = () => {
  const stats = loadReferralStats();
  const localPlayerId = useSelector((s: RootState) => s.session.localPlayerId);

  const referralCode = generateNumericCode(localPlayerId);

  if (!referralCode) return null;

  const [copied, setCopied] = useState(false);

  const onCardPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleShare(referralCode);
  };

  const onCopyPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 16 }}
      className="relative mb-10 mt-4"
    >
      <TouchableOpacity
        onPress={onCardPress}
        activeOpacity={0.9}
        className="overflow-hidden rounded-[40px] border-2 border-indigo-500/30 bg-slate-900"
        style={{
          shadowColor: "#6366f1",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 25,
          elevation: 15,
        }}
      >
        {/* Animated Background Glow */}
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{
            loop: true,
            duration: 3000,
            type: "timing",
          }}
          className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: 1.15 }}
          transition={{
            loop: true,
            duration: 4000,
            type: "timing",
          }}
          className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"
        />

        <View className="p-7">
          {/* Top Badge */}
          <View className="mb-5 self-start rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-emerald-400" />
              <Text className="font-main-bold text-[10px] tracking-[2px] text-emerald-200">
                Earn 100K Coins
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View className="flex-row items-end justify-between">
            <View className="flex-1">
              <Text
                style={{ fontSize: rf(3.2) }}
                className="font-main-bold leading-tight text-white"
              >
                Referrals
              </Text>

              <View className="mt-4 flex-row items-center gap-8">
                {/* Redemptions */}
                <View className="items-center">
                  <Text className="font-main-bold text-2xl text-white">
                    {stats.totalShares}
                  </Text>
                  <Text className="text-[9px] uppercase tracking-tighter text-white/40">
                    Redemptions
                  </Text>
                </View>

                {/* Coins Earned */}
                <View className="items-center">
                  <View className="flex-row items-center">
                    <Text className="mr-1 text-sm">🪙</Text>
                    <Text className="font-main-bold text-2xl text-yellow-500">
                      {formatCompactNumber(stats.totalEarned)}
                    </Text>
                  </View>
                  <Text className="text-[9px] uppercase tracking-tighter text-white/40">
                    Coins Earned
                  </Text>
                </View>
              </View>
            </View>

            {/* Icon Visual */}
            <MotiView
              from={{ rotate: "0deg" }}
              animate={{ rotate: "360deg" }}
              transition={{
                loop: true,
                duration: 20000,
                type: "timing",
              }}
              className="h-24 w-24 items-center justify-center rounded-full border-[4px] border-slate-900 bg-indigo-950"
            >
              <View className="absolute inset-0 rounded-full border-[6px] border-b-indigo-700 border-l-violet-500 border-r-blue-500 border-t-indigo-500 opacity-60" />
              <Users size={32} color="white" />
            </MotiView>
          </View>

          {/* Code + Actions */}
          <View className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] uppercase tracking-[3px] text-white/40">
                  Your Code
                </Text>
                <Text className="font-main-bold text-2xl text-white tracking-[4px] mt-1">
                  {referralCode}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={onCopyPress}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  {copied ? (
                    <Check size={20} color="#34D399" />
                  ) : (
                    <Copy size={20} color="#A5B4FC" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onCardPress}
                  className="rounded-2xl border border-emerald-400/30 bg-emerald-500/20 p-3"
                >
                  <Share2 size={20} color="#6ee7b7" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer CTA */}
          <MotiView
            from={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{
              loop: true,
              duration: 2000,
              type: "timing",
            }}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 py-3.5"
          >
            <Gift size={16} color="white" />
            <Text className="font-main-bold text-[12px] uppercase tracking-[3px] text-white">
              Invite Friends
            </Text>
          </MotiView>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};
