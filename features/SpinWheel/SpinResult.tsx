import React, { memo } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated"; // Use Reanimated's Animated
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { SpinResultProps } from "./types";

const SpinResult = ({ status, result, pulseAnim }: SpinResultProps) => {
  const isDone = status === "DONE" && result;

  // 1. Define the animated style hook
  // This ensures 'pulseAnim.value' is accessed on the UI thread, not during React render
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }], 
    };
  });

  return (
    <View className="h-28 justify-center items-center mb-6 px-4">
      {isDone ? (
        <Animated.View
          style={animatedStyle} // 2. Apply the hook here
          className="items-center"
        >
          <Text
            style={{ color: result.color, fontSize: rf(6) }}
            className="font-main-bold"
          >
            {result.value > 0 ? `+${result.value}` : result.value}
          </Text>

          <Text className="text-white/40 text-[10px] font-main-bold tracking-[4px] uppercase mt-1">
            {result.value < 0 ? "TREASURY RAIDED" : "GOLD CLAIMED"}
          </Text>
        </Animated.View>
      ) : (
        <Text className="text-zinc-500 text-base font-main-md text-center leading-5 px-6">
          In the court of kings, a single turn can make you a lord or a thief.
        </Text>
      )}
    </View>
  );
};

export default memo(SpinResult);