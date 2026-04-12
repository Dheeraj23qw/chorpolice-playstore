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
} from "react-native-reanimated";

export default function AnimatedLogoLoader() {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const bounce = useSharedValue(0);

  useEffect(() => {
    // Continuous rotation (360 degrees loop)
    rotate.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );

    // Pulsing scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Subtle bounce up & down
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
      { translateY: bounce.value },
    ],
    // Remove heavy shadows for Android performance
    opacity: interpolate(scale.value, [0.95, 1.1], [0.8, 1]),
  }));

  return (
    <View className="flex-1 items-center justify-end">
      <Animated.View
        style={animatedStyle}
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
