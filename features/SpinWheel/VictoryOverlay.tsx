import React from "react";
import { View } from "react-native";
import { VictoryCelebration } from "@/components/VictoryCelebration";
import { VictoryOverlayProps } from "./types";



const VictoryOverlay = ({ visible, onComplete }: VictoryOverlayProps) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      <VictoryCelebration
        type="GOLD"
        intensity="HIGH"
        onComplete={onComplete}
      />
    </View>
  );
};

export default React.memo(VictoryOverlay);
