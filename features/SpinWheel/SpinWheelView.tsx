import React, { memo } from "react";
import { View, Image } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Trophy } from "lucide-react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { SpinWheelViewProps } from "./types";

const SpinWheelView: React.FC<SpinWheelViewProps> = ({
  spinAnim,
  segments,
}) => {
  const wheelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinAnim.value}deg` }],
    };
  });

  return (
    <View className="relative my-10 items-center justify-center">
      {/* Glow */}
      <View className="absolute h-[320px] w-[320px] rounded-full bg-indigo-500/10" />

      {/* WHEEL IMAGE */}
      <Animated.View
        style={wheelStyle}
        className="h-[300px] w-[300px] items-center justify-center overflow-hidden rounded-full shadow-2xl"
      >
        <Image
          source={require("@/assets/modalImages/spin_wheel.webp")}
          style={{ width: 300, height: 300 }}
          className="rounded-full"
          resizeMode="contain"
        />
      </Animated.View>

      {/* POINTER */}
      <View className="pointer-events-none absolute -top-5 z-30 items-center">
        <View className="h-12 w-2 rounded-full bg-white" />
        <View className="absolute -top-2 h-5 w-5 rounded-full border-2 border-white bg-indigo-500" />
      </View>
    </View>
  );
};

export default memo(SpinWheelView);
