import React, { useCallback } from "react";
import { ViewProps, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
  interpolate,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "modal" | "fast" | "dramatic";
  breathing?: boolean;
}

export default function ScreenWrapper({
  children,
  style,
  variant = "default",
  breathing = true,
  ...rest
}: ScreenWrapperProps) {
  const progress = useSharedValue(0); // Single source of truth for entrance
  const scale = useSharedValue(1);

  /* ---------------- Animation Config ---------------- */

  const getConfig = () => {
    switch (variant) {
      case "dramatic":
        return {
          spring: { damping: 12, stiffness: 90, mass: 0.8 },
          duration: 800,
          yOffset: 80,
          rotate: "10deg",
        };
      case "modal":
        return {
          spring: { damping: 16, stiffness: 85 },
          duration: 500,
          yOffset: 50,
          rotate: "5deg",
        };
      case "fast":
        return {
          spring: { damping: 20, stiffness: 150 },
          duration: 300,
          yOffset: 20,
          rotate: "2deg",
        };
      default:
        return {
          spring: { damping: 15, stiffness: 100 },
          duration: 600,
          yOffset: 40,
          rotate: "0deg",
        };
    }
  };

  const config = getConfig();

  useFocusEffect(
    useCallback(() => {
      // 1. Entrance Animation
      progress.value = withSpring(1, config.spring);

      // 2. Breathing Effect (Subtle scale)
      if (breathing) {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.01, { duration: 2500, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
            withTiming(1, { duration: 2500, easing: Easing.bezier(0.42, 0, 0.58, 1) })
          ),
          -1,
          true
        );
      }

      return () => {
        // Cleanup: Reset and cancel to prevent "ghost" animations on return
        cancelAnimation(progress);
        cancelAnimation(scale);
        progress.value = 0;
        scale.value = 1;
      };
    }, [variant, breathing])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      opacity: progress.value,
      transform: [
        { perspective: 1000 }, // Necessary for 3D rotations
        { translateY: interpolate(progress.value, [0, 1], [config.yOffset, 0]) },
        { scale: scale.value * interpolate(progress.value, [0, 1], [0.95, 1]) },
        { rotateX: `${interpolate(progress.value, [0, 1], [5, 0])}deg` }
      ],
    };
  });

  return (
    <Animated.View 
      style={[animatedStyle, style]} 
      // Improves performance by hinting to the OS that this view animates
      renderToHardwareTextureAndroid={true} 
      {...rest}
    >
      {children}
    </Animated.View>
  );
}