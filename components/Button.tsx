import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";

interface ButtonProps extends PressableProps {
  title: string;
  className?: string;
  textClassName?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => (scale.value = withSpring(0.95));
  const onPressOut = () => (scale.value = withSpring(1));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[animatedStyle]}
      // Your default button style (rounded, centered, background)
      className={`bg-blue-600 p-4 rounded-2xl items-center justify-center ${className || ""}`}
    >
      <Text className={`font-main-bold text-lg ${textClassName || ""}`}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}
