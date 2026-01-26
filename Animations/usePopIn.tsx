import { useEffect } from "react";
import {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

interface PopInConfig {
  startScale?: number;
  endScale?: number;
  duration?: number;
}

export const usePopIn = (
  visible: boolean,
  config?: PopInConfig
) => {
  const {
    startScale = 0.85,
    endScale = 1,
    duration = 220,
  } = config || {};

  const scale = useSharedValue(startScale);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(endScale, {
        damping: 14,
        stiffness: 160,
      });

      opacity.value = withTiming(1, { duration });
    } else {
      scale.value = withTiming(startScale, { duration: 120 });
      opacity.value = withTiming(0, { duration: 120 });
    }
  }, [visible]);

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return {
    style,
  };
};
