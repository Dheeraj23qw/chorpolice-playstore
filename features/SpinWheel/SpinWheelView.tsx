import React, { memo } from "react";
import { View, Animated, Image } from "react-native";
import { Trophy } from "lucide-react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { SpinSegment } from "./types"; // Adjust path as needed

interface SpinWheelViewProps {
  spinAnim: Animated.Value;
  segments: SpinSegment[];
}

const SpinWheelView: React.FC<SpinWheelViewProps> = ({ spinAnim, segments }) => {
  return (
    <View className="relative items-center justify-center my-10">
      {/* 🌌 Background Ambient Glow */}
      <View className="absolute h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* 🎡 Rotating Wheel Container */}
      <Animated.View
        style={{
          transform: [
            {
              rotate: spinAnim.interpolate({
                inputRange: [0, 500000],
                outputRange: ["0deg", "500000deg"],
              }),
            },
          ],
        }}
        className="w-[300px] h-[300px] rounded-full bg-zinc-900 border-[10px] border-zinc-950 overflow-hidden shadow-2xl"
      >
        {segments.map((seg, i) => (
          <View
            key={i}
            className="absolute w-1/2 h-1/2 items-center justify-center border-[0.5px] border-white/10"
            style={{
              top: i < 2 ? 0 : "50%",
              left: i % 2 === 0 ? 0 : "50%",
              backgroundColor: seg.bg,
            }}
          >
            {/* Circular Premium Badge */}
            <View
              className="w-16 h-16 rounded-full items-center justify-center border-2 bg-white/5 shadow-lg"
              style={{ borderColor: seg.color }}
            >
              <Image
                source={seg.img}
                className="w-11 h-11 rounded-full"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[10px] font-main-bold text-white mt-2 tracking-[2px] uppercase">
              {seg.label}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* 🏆 Center Hub (Fixed) */}
      <View className="absolute z-20 w-16 h-16 bg-zinc-950 rounded-full border-2 border-indigo-500 items-center justify-center shadow-2xl shadow-indigo-500/50">
        <Trophy size={rf(3.5)} color="#818cf8" />
      </View>

      {/* 📍 Pointer (Fixed at Top) */}
      <View className="absolute -top-5 z-30 items-center" pointerEvents="none">
        <View className="w-2 h-12 bg-white rounded-full shadow-sm" />
        <View className="w-5 h-5 bg-indigo-500 rounded-full absolute -top-2 border-2 border-white shadow-md" />
      </View>
    </View>
  );
};

export default memo(SpinWheelView);