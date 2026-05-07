import React, { memo } from "react";
import { View } from "react-native";

import { Text } from "@/components/Text";
import { rf, wp } from "@/utils/responsive";

type RoundBadgeProps = {
  round: number;
};

export const RoundBadge = memo(({ round }: RoundBadgeProps) => {
  return (
    <View className="mb-10 mt-8 items-center">
      <View
        className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-6 py-2"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
      >
        <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/30" />

        <Text
          style={{ fontSize: rf(1.4), letterSpacing: wp(1) }}
          className="font-main-bold uppercase text-indigo-300"
        >
          Round {round}
        </Text>
      </View>
    </View>
  );
});

RoundBadge.displayName = "RoundBadge";
