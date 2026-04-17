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

      {/* WHEEL */}
      <Animated.View
        style={wheelStyle}
        className="h-[300px] w-[300px] overflow-hidden rounded-full border-[10px] border-zinc-950 bg-zinc-900"
      >
        {/* GRID WRAPPER */}
        <View className="flex-1 flex-row flex-wrap">
          {segments.map((seg, i) => (
            <View
              key={i}
              className="h-1/2 w-1/2 items-center justify-center"
              style={{ backgroundColor: seg.bg }}
            >
              {/* Inner circle */}
              <View
                className="h-16 w-16 items-center justify-center rounded-full border-2 bg-white/5"
                style={{ borderColor: seg.color }}
              >
                <Image
                  source={seg.img}
                  className="h-11 w-11 rounded-full"
                  resizeMode="cover"
                />
              </View>

              <Text className="mt-2 font-main-bold text-[10px] uppercase tracking-[2px] text-white">
                {seg.label}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* CENTER HUB */}
      <View className="absolute z-20 h-16 w-16 items-center justify-center rounded-full border-2 border-indigo-500 bg-zinc-950">
        <Trophy size={rf(3.5)} color="#818cf8" />
      </View>

      {/* POINTER */}
      <View className="pointer-events-none absolute -top-5 z-30 items-center">
        <View className="h-12 w-2 rounded-full bg-white" />
        <View className="absolute -top-2 h-5 w-5 rounded-full border-2 border-white bg-indigo-500" />
      </View>
    </View>
  );
};

export default memo(SpinWheelView);
