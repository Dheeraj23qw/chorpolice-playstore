import React, { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text } from "@/components/Text";

const WifiHint = () => {
  const floatY = useSharedValue(0);

  // 🎯 Smooth floating animation
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View className="mb-6 flex-row items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
      {/* 🔮 Soft Glow */}
      <View className="absolute left-4 h-20 w-20 rounded-full bg-purple-500/20 blur-2xl" />

      {/* 🕺 Floating Character */}
      <Animated.View style={floatStyle} className="mr-4">
        <Image
          source={require("@/assets/images/chorsipahi/thief.png")}
          className="h-20 w-20"
          resizeMode="contain"
        />
      </Animated.View>

      {/* 📶 Text Content */}
      <View className="flex-1">
        <Text className="mb-1 font-main-bold text-base text-white">
          Play with Friends
        </Text>

        {/* ✅ Instructions */}
        <Text className="text-sm leading-5 text-white/70">
          1. Connect everyone to the{" "}
          <Text className="text-purple-300">same WiFi 📶</Text>
          {"\n"}
          2. One player taps <Text className="text-green-300">Host Game</Text>
          {"\n"}
          3. Others tap <Text className="text-blue-300">Join Game</Text>
          {"\n"}
          4. No friends?{" "}
          <Text className="text-yellow-300">Just tap Host or Join 😉</Text>
        </Text>

        {/* ⚠️ Warning */}
        <Text className="mt-2 text-xs text-red-400/70">
          Won’t work on mobile data or different WiFi
        </Text>
      </View>
    </View>
  );
};

export default React.memo(WifiHint);
