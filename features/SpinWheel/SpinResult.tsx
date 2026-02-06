import React, { memo } from "react";
import { View, Animated } from "react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { SpinResultProps } from "./types";

const SpinResult = ({ status, result, pulseAnim }: SpinResultProps) => {
  return (
    <View className="h-28 justify-center items-center mb-6 px-4">
      {status === "DONE" && result ? (
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
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
