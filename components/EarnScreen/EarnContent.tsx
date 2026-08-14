// components/EarnScreen/EarnContent.tsx
import React from "react";
import { ScrollView, View, Pressable } from "react-native";
import { MotiView } from "moti";
import { Gift, Share2, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { MilestonesSection } from "@/components/EarnScreen/MilestonesSection";
import { ReferralStatsCard } from "@/components/EarnScreen/ReferralStatsCard";
import { REWARD_TIERS, RewardTier } from "@/constants/RewardsConst";

interface Props {
  coins: number;
  cardWidth: number;
  handleClaim: (tier: RewardTier) => void;
  onRedeemPress?: () => void;
}

export const EarnContent = ({
  coins,
  cardWidth,
  handleClaim,
  onRedeemPress,
}: Props) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-slate-950"
      contentContainerClassName="pb-12 pt-4 px-5"
    >
      {/* Redeem Coins CTA */}
      <MotiView
        from={{ opacity: 0, translateY: 20, scale: 0.96 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "spring", damping: 16 }}
        className="mb-8 overflow-hidden rounded-[32px] border border-emerald-500/30 bg-slate-900"
      >
        <View className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-emerald-600/15 blur-3xl" />
        <View className="p-6">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/30">
              <Gift size={22} color="#6ee7b7" />
            </View>
            <View>
              <Text className="font-main-bold text-lg text-white">
                Redeem Coins
              </Text>
              <Text className="text-[10px] uppercase tracking-[2px] text-emerald-300/70">
                Referral Bonus
              </Text>
            </View>
          </View>

          <Text className="font-main-md text-sm text-white/70 leading-5 mb-4">
            Enter a friend&apos;s 5-digit referral code and get{" "}
            <Text className="font-main-bold text-yellow-400">100,000</Text> bonus
            coins instantly. Share your code too and earn together!
          </Text>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRedeemPress?.();
              }}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 active:opacity-80"
            >
              <Share2 size={18} color="white" />
              <Text className="font-main-bold text-sm uppercase tracking-widest text-white">
                Enter Code
              </Text>
            </Pressable>
            <View className="flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
              <Users size={18} color="#a5b4fc" />
              <Text className="ml-2 font-main-bold text-xs text-indigo-200">
                +100K 🪙
              </Text>
            </View>
          </View>
        </View>
      </MotiView>

      <ReferralStatsCard />

      <MilestonesSection
        tiers={REWARD_TIERS}
        coins={coins}
        cardWidth={cardWidth}
        onClaim={handleClaim}
      />
    </ScrollView>
  );
};
