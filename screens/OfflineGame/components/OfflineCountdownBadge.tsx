import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { hp } from "@/utils/responsive";

interface OfflineCountdownBadgeProps {
  value: number;
}

export const OfflineCountdownBadge: React.FC<OfflineCountdownBadgeProps> = ({
  value,
}) => {
  return (
    <MotiView
      from={{ scale: 0.35, opacity: 0, translateY: 15 }}
      animate={{ scale: 1, opacity: 1, translateY: 0 }}
      key={value}
      transition={{ type: "timing", duration: 650 }}
      className="absolute inset-x-0 items-center"
      style={{ bottom: hp(2) }}
    >
      <View
        className="items-center justify-center rounded-full border-2 border-white/15 bg-indigo-500/90"
        style={{ width: 80, height: 80 }}
      >
        {/* Adjusted inner ring inset */}
        <View className="absolute inset-[4px] rounded-full border border-white/20 bg-indigo-950/30" />

        <Text
          style={{ fontSize: 48, lineHeight: 48 }}
          className="text-center font-main-bold text-white"
        >
          {value}
        </Text>
      </View>
    </MotiView>
  );
};
