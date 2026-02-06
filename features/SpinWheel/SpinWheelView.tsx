import React, { memo, useMemo } from "react";
import { View, Animated, Image } from "react-native";
import { Trophy } from "lucide-react-native";
import { SpinWheelViewProps } from "./types";

const MAX_ROTATION = 360 * 10; // must match your hook

const SpinWheelView = ({ spinAnim, segments }: SpinWheelViewProps) => {
  // ✅ Safe interpolation range
  const rotate = useMemo(() => {
    return spinAnim.interpolate({
      inputRange: [0, MAX_ROTATION],
      outputRange: ["0deg", `${MAX_ROTATION}deg`],
      extrapolate: "clamp",
    });
  }, [spinAnim]);

  return (
    <View className="relative items-center justify-center my-10">
      {/* Glow */}
      <View className="absolute h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-2xl" />

      {/* Wheel */}
      <Animated.View
        style={{ transform: [{ rotate }] }}
        className="w-[300px] h-[300px] rounded-full bg-zinc-900 border-[10px] border-zinc-950 overflow-hidden"
      >
        {segments.map((seg, i) => (
          <View
            key={seg.label}
            style={{
              position: "absolute",
              width: "50%",
              height: "50%",
              top: i < 2 ? 0 : "50%",
              left: i % 2 === 0 ? 0 : "50%",
              backgroundColor: seg.bg,
            }}
            className="items-center justify-center"
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                borderWidth: 2,
                borderColor: seg.color,
              }}
              className="items-center justify-center"
            >
              <Image
                source={seg.img}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Center Hub */}
      <View className="absolute z-20 w-12 h-12 bg-black rounded-full border-2 border-indigo-500 items-center justify-center">
        <Trophy size={20} color="#818cf8" />
      </View>

      {/* Pointer */}
      <View className="absolute -top-5 z-30 items-center">
        <View className="w-2 h-12 bg-white rounded-full" />
      </View>
    </View>
  );
};

export default memo(SpinWheelView);
