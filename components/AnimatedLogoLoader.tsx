import React, { useEffect } from "react";
import { View } from "react-native"; // Standard View for the wrapper
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
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View className="flex-1 items-center justify-center">
   
      <Animated.View 
        style={animatedStyle}
        className="w-24 h-24 rounded-full overflow-hidden bg-indigo-500 items-center justify-center border-4 border-indigo-200 shadow-xl"
      >
        <Animated.Image
          source={require("@/assets/images/chorsipahi/king.png")}
          className="w-full h-full rounded-full"
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}