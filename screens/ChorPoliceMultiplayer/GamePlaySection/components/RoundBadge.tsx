import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import { rf, wp } from "@/utils/responsive";

interface RoundBadgeProps {
  round: number;
}

export const RoundBadge: React.FC<RoundBadgeProps> = React.memo(({ round }) => {
  return (
    <View 
      className="bg-white/10 self-center px-6 py-2 rounded-full border border-white/20 mb-6"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}
    >
      <Text className="text-white font-main-bold" style={{ fontSize: rf(16) }}>
        ROUND {round}
      </Text>
    </View>
  );
});
