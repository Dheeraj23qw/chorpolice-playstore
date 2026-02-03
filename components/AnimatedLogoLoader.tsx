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
    // Continuous rotation
    rotate.value = withRepeat(
      withTiming(1000,{ duration: 2800, easing: Easing.linear }),
      -1
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
        withTiming(-8, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 400, easing: Easing.inOut(Easing.ease) })
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
    shadowOpacity: interpolate(scale.value, [0.95, 1.1], [0.3, 0.7]),
    shadowRadius: interpolate(scale.value, [0.95, 1.1], [10, 25]),
  }));

  return (
    <View className="flex-1 items-center justify-center">
      <Animated.View
        style={animatedStyle}
        className="w-28 h-28 rounded-full overflow-hidden items-center justify-center border-4 border-white shadow-xl"
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
