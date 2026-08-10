import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

const ScoringRules = () => {
  return (
    <View className="mt-8 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.035]">
      {/* Header */}
      <View className="border-b border-white/[0.08] px-4 py-3">
        <Text
          style={{ fontSize: rf(0.9) }}
          className="font-main-bold tracking-[1.8px] text-white/40"
        >
          SCORING RULES
        </Text>
      </View>

      {/* Correct */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10">
            <Ionicons name="checkmark" size={rf(1.5)} color="#34D399" />
          </View>

          <Text
            style={{ fontSize: rf(1.15) }}
            className="font-main-bold text-white/75"
          >
            Correct
          </Text>
        </View>

        <Text
          style={{ fontSize: rf(1.2) }}
          className="font-main-bold text-emerald-400"
        >
          +2,000
        </Text>
      </View>

      {/* Wrong */}
      <View className="flex-row items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <View className="flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-xl bg-red-400/10">
            <Ionicons name="close" size={rf(1.5)} color="#F87171" />
          </View>

          <Text
            style={{ fontSize: rf(1.15) }}
            className="font-main-bold text-white/75"
          >
            Wrong
          </Text>
        </View>

        <Text
          style={{ fontSize: rf(1.2) }}
          className="font-main-bold text-red-400"
        >
          −2,000
        </Text>
      </View>

      {/* No Answer */}
      <View className="flex-row items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <View className="flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06]">
            <Ionicons name="remove" size={rf(1.4)} color="#9CA3AF" />
          </View>

          <Text
            style={{ fontSize: rf(1.15) }}
            className="font-main-bold text-white/75"
          >
            No Answer
          </Text>
        </View>

        <Text
          style={{ fontSize: rf(1.2) }}
          className="font-main-bold text-red-400"
        >
          −2,000
        </Text>
      </View>
    </View>
  );
};

export default ScoringRules;
