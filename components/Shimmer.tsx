import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function Shimmer({ className }: { className?: string }) {
  const translateX = useSharedValue(-150);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(150, { duration: 1200 }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View className={`overflow-hidden bg-gray-800 ${className}`}>
      <Animated.View
        style={animatedStyle}
        className="absolute inset-0 bg-white/10"
      />
    </Animated.View>
  );
}
