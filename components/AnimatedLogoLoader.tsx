import React, { useEffect } from "react";
import { Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function AnimatedLogoLoader() {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1
    );

    scale.value = withRepeat(
      withTiming(1.2, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={style}>
      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        className="w-20 h-20"
        resizeMode="contain"
      />
    </Animated.View>
  );
}
