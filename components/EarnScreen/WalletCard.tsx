import React from "react";
import { View } from "react-native";
import { Coins, Zap } from "lucide-react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface PremiumWalletCardProps {
  balance: number;
}

export const WalletCard = ({ balance }: PremiumWalletCardProps) => {
  return (
    <View className="relative mb-10 overflow-hidden rounded-[40px] bg-indigo-600 p-8 shadow-2xl shadow-indigo-500/30">
      {/* Decorative Orbs */}
      <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <View className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-indigo-400/20" />

      <View className="flex-row items-center justify-between">
        <View>
          <View className="mb-1 flex-row items-center space-x-2">
            <Zap size={14} color="#c7d2fe" fill="#c7d2fe" />
            <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-indigo-100">
              Available Balance
            </Text>
          </View>

          <View className="flex-row items-baseline">
            <Text
              style={{ fontSize: rf(4.5) }} // Slightly larger since button is gone
              className="font-main-bold text-white"
            >
              {balance.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Premium Icon Container */}
        <View className="h-16 w-16 items-center justify-center rounded-[24px] border border-white/30 bg-white/20 shadow-lg">
          <Coins size={32} color="white" strokeWidth={2} />
        </View>
      </View>
    </View>
  );
};
