import React, { memo } from "react";
import { View } from "react-native";

import { Text } from "../../Text";

interface ResultBadgeProps {
  clicked: boolean;
  flipped: boolean;
}

const ResultBadgeComponent: React.FC<ResultBadgeProps> = ({
  clicked,
  flipped,
}) => {
  if (!clicked || flipped) return null;

  return (
    <View className="absolute right-3 top-3 z-20 rounded-full border border-yellow-400/50 bg-yellow-500/20 px-3 py-1 shadow-lg">
      <Text className="font-main-bold text-[10px] uppercase tracking-wider text-yellow-300">
        Selected
      </Text>
    </View>
  );
};

export const ResultBadge = memo(ResultBadgeComponent);
