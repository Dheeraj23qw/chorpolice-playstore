import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Users, Gift } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSelector } from "react-redux";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { loadReferralStats } from "@/storage/referralStatsStorage";
import { handleShare } from "@/utils/share";
import { generateNumericCode } from "@/utils/referral";
import { RootState } from "@/redux/store";

export const ReferralStatsCard = () => {
  const stats = loadReferralStats();
  const localPlayerId = useSelector((s: RootState) => s.session.localPlayerId);

  const referralCode = generateNumericCode(localPlayerId);

  const onCardPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    handleShare(referralCode);
  };

  return (
    <TouchableOpacity
      onPress={onCardPress}
      activeOpacity={0.9}
      className="relative mb-10 mt-4 overflow-hidden rounded-[40px] border-2 border-indigo-500/30 bg-slate-900"
      style={{
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 15,
      }}
    >
      {/* Background Glow */}
      <View className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
      <View className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

      <View className="p-7">
        {/* Top Badge */}
        <View className="mb-4 flex-row items-center">
          <View className="mr-2 h-2 w-2 rounded-full bg-indigo-400" />

          <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-indigo-300">
            Network Activity
          </Text>
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
              <View className="mr-8 items-center">
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
                    {stats.totalEarned.toLocaleString()}
                  </Text>
                </View>

                <Text className="text-[9px] uppercase tracking-tighter text-white/40">
                  Coins Earned
                </Text>
              </View>
            </View>
          </View>

          {/* Icon Visual */}
          <View className="h-24 w-24 items-center justify-center rounded-full border-[4px] border-slate-900 bg-indigo-950">
            <View className="absolute inset-0 rounded-full border-[6px] border-b-indigo-700 border-l-violet-500 border-r-blue-500 border-t-indigo-500 opacity-60" />

            <Users size={32} color="white" />
          </View>
        </View>

        {/* Footer CTA */}
        <View className="mt-6 flex-row items-center justify-center rounded-2xl bg-indigo-500 py-3">
          <Gift size={14} color="white" className="mr-2" />

          <Text className="font-main-bold text-[11px] uppercase tracking-widest text-white">
            Invite Friends
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
