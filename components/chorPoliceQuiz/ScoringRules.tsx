import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

const ScoringRules = () => {
  return (
    <View className="mt-6 w-full">
      {/* Section Title */}
      <Text
        style={{ fontSize: rf(0.9) }}
        className="mb-2 text-center font-main-bold uppercase tracking-[2px] text-white/40"
      >
        Scoring Rules
      </Text>

      {/* 3-Column Compact Grid */}
      <View className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-sm shadow-black">
        {/* ROW 1: HEADINGS */}
        <View className="flex-row border-b border-white/10 bg-white/5">
          <View className="flex-1 items-center justify-center border-r border-white/10 py-2">
            <Text
              style={{ fontSize: rf(0.9) }}
              className="font-main-bold uppercase tracking-wider text-white/60"
            >
              Correct
            </Text>
          </View>

          <View className="flex-1 items-center justify-center border-r border-white/10 py-2">
            <Text
              style={{ fontSize: rf(0.9) }}
              className="font-main-bold uppercase tracking-wider text-white/60"
            >
              Wrong
            </Text>
          </View>

          <View className="flex-1 items-center justify-center py-2">
            <Text
              style={{ fontSize: rf(0.9) }}
              className="font-main-bold uppercase tracking-wider text-white/60"
            >
              No Answer
            </Text>
          </View>
        </View>

        {/* ROW 2: VALUES & ICONS */}
        <View className="flex-row">
          <View className="flex-1 flex-row items-center justify-center border-r border-white/10 py-2.5">
            <Ionicons
              name="checkmark"
              size={rf(1.3)}
              color="#34D399"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{ fontSize: rf(1.15) }}
              className="font-main-bold text-emerald-400"
            >
              +2,000
            </Text>
          </View>

          <View className="flex-1 flex-row items-center justify-center border-r border-white/10 py-2.5">
            <Ionicons
              name="close"
              size={rf(1.3)}
              color="#F87171"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{ fontSize: rf(1.15) }}
              className="font-main-bold text-red-400"
            >
              −2,000
            </Text>
          </View>

          <View className="flex-1 flex-row items-center justify-center py-2.5">
            <Ionicons
              name="remove"
              size={rf(1.3)}
              color="#9CA3AF"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{ fontSize: rf(1.15) }}
              className="font-main-bold text-red-400"
            >
              −2,000
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ScoringRules;
