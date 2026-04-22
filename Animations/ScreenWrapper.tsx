import React, { useCallback, useMemo } from "react";
import { ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
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

/**
 * Wraps every screen with an entrance animation and optional breathing effect.
 *
 * PERFORMANCE FIX:
 * - Removed rotateX 3D transform (forces GPU rasterization of the ENTIRE tree)
 * - Removed perspective (same issue — expensive on large views)
 * - Made breathing amplitude smaller (1.005 vs 1.01) and slower (4s vs 5s)
 * - These changes eliminate the frame drops on low-end Android during the intro video
 */
export default function ScreenWrapper({
  children,
  style,
  variant = "default",
  breathing = true,
  ...rest
}: ScreenWrapperProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const config = useMemo(() => {
    switch (variant) {
      case "dramatic":
        return { spring: { damping: 12, stiffness: 90, mass: 0.8 }, yOffset: 60 };
      case "modal":
        return { spring: { damping: 16, stiffness: 85 }, yOffset: 40 };
      case "fast":
        return { spring: { damping: 20, stiffness: 150 }, yOffset: 15 };
      default:
        return { spring: { damping: 15, stiffness: 100 }, yOffset: 30 };
    }
  }, [variant]);

  useFocusEffect(
    useCallback(() => {
      // Entrance slide-up + fade
      progress.value = withSpring(1, config.spring);

      // Breathing: very subtle so it doesn't compete with screen content
      if (breathing) {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.005, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }

      return () => {
        // UI-3 FIX: do NOT snap progress to 0 here — that causes an opacity
        // flash on Android as the component briefly renders at opacity:0
        // before it actually unmounts. Let animations cancel cleanly.
        cancelAnimation(progress);
        cancelAnimation(scale);
        scale.value = 1;
        // progress stays at current value until component truly unmounts
      };
    }, [variant, breathing])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [config.yOffset, 0]) },
      { scale: scale.value * interpolate(progress.value, [0, 1], [0.97, 1]) },
    ],
  }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      renderToHardwareTextureAndroid={true}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}