import React from "react";
import { View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";

interface Props {
  progress: number;
}

export default function ProgressBar({ progress }: Props) {
  return (
    <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-8">
      <Animated.View
        layout={Layout.springify()}
        className="h-full bg-amber-500"
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}
