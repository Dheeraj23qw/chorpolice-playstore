import React from "react";
import { View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";

interface Props {
  total: number;
  activeIndex: number;
}

export default function StepDots({ total, activeIndex }: Props) {
  return (
    <View className="flex-row justify-center my-7">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;

        return (
          <Animated.View
            key={`dot-${index}`}
            layout={Layout.springify()}
            className="h-2 mx-1 rounded-full"
            style={{
              width: isActive ? 28 : 8,
              backgroundColor: isActive
                ? "#f59e0b"
                : "rgba(255,255,255,0.2)",
            }}
          />
        );
      })}
    </View>
  );
}
