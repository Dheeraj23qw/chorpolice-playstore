import React, { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
} from "react-native-reanimated";

/**
 * Simplified logo loader — runs on the UI thread via Reanimated.
 *
 * WHY reduced from 3 to 2 animations:
 * The original had rotate + scale + bounce running simultaneously.
 * On low-end Android, 3 infinite animations for a loading spinner
 * was overkill — each one creates a worklet frame callback.
 * Reduced to rotate + subtle pulse which looks cleaner and runs smoother.
 */
export default function AnimatedLogoLoader() {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Smooth rotation
    rotate.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Gentle pulse (replaces both scale AND bounce — one animation instead of two)
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.97, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    return () => {
      cancelAnimation(rotate);
      cancelAnimation(pulse);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: pulse.value },
    ],
    opacity: interpolate(pulse.value, [0.97, 1.08], [0.85, 1]),
  }));

  return (
    <View className="flex-1 items-center justify-end">
      <Animated.View
        style={animatedStyle}
        renderToHardwareTextureAndroid={true}
        className="w-20 h-20 rounded-full overflow-hidden items-center justify-center border-4 border-white shadow-xl"
      >
        <Image
          source={require("@/assets/images/chorsipahi/king.png")}
          className="w-full h-full rounded-full"
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}
