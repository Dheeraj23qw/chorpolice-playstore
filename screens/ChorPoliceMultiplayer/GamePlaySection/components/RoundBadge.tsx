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
      className="self-center rounded-full border border-white/20 bg-white/10 px-6 py-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text className="font-main-bold text-white" style={{ fontSize: rf(16) }}>
        ROUND {round}
      </Text>
    </View>
  );
});
