import React, { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/Text";

const WifiHint = () => {
  const floatY = useSharedValue(0);

  // 🎯 Floating animation (smooth + premium feel)
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200 }),
        withTiming(0, { duration: 1200 }),
      ),
      -1,
      true,
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View className="mb-6 flex-row items-center rounded-3xl border border-white/10 bg-white/5 p-4">
      {/* 🔮 Glow (background effect) */}
      <View className="absolute left-4 h-16 w-16 rounded-full bg-purple-500/20 blur-xl" />

      {/* 🕺 Floating Character */}
      <Animated.View style={floatStyle} className="mr-4">
        <Image
          source={require("@/assets/images/chorsipahi/thief.png")}
          className="h-20 w-20"
          resizeMode="contain"
        />
      </Animated.View>

      {/* 📶 Text */}
      <View className="flex-1">
        <Text className="mb-1 font-main-bold text-base text-white">
          Play with Friends
        </Text>

        <Text className="text-sm leading-5 text-white/60">
          Make sure all players are on the{" "}
          <Text className="text-purple-300">same WiFi network 📶</Text>
        </Text>
      </View>
    </View>
  );
};

export default React.memo(WifiHint);
