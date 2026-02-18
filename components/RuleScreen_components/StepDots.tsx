import React, { memo } from "react";
import { View } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
} from "react-native-reanimated";

interface Props {
  total: number;
  activeIndex: number;
}

/* ---------------------------------------------------
    ✅ Named Sub-component (Fixes Display Name Error)
--------------------------------------------------- */
const Dot = memo(function Dot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const isActive = index === activeIndex;

  const animatedStyle = useAnimatedStyle(() => {
    // Smoothly transition width and color
    const width = withSpring(isActive ? 32 : 8, {
      damping: 15,
      stiffness: 120,
    });

    const backgroundColor = withSpring(
      isActive ? "#6366f1" : "rgba(255, 255, 255, 0.15)",
      { damping: 20 }
    );

    return {
      width,
      backgroundColor,
    };
  }, [isActive]); // Added dependency to ensure the worklet updates correctly

  return (
    <View className="relative items-center justify-center">
      <Animated.View
        style={animatedStyle}
        className="h-2 mx-1.5 rounded-full"
      />
      {/* 🌟 The "Metamorphic" Glow - only visible behind active dot */}
      {isActive && (
        <Animated.View 
          className="absolute inset-0 bg-indigo-500/40 blur-md rounded-full -z-10"
          style={{ width: 32 }}
        />
      )}
    </View>
  );
});

Dot.displayName = "Dot";

/* ---------------------------------------------------
    ✅ Main Component
--------------------------------------------------- */
export default function StepDots({ total, activeIndex }: Props) {
  return (
    <View className="flex-row justify-center items-center my-8">
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={`dot-${index}`} index={index} activeIndex={activeIndex} />
      ))}
    </View>
  );
}