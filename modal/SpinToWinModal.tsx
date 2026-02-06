import React, { useState, useRef, useEffect, memo } from "react";
import { Modal, View, TouchableOpacity, Animated, Image } from "react-native";
import { Text } from "@/components/Text";
import { Star, Trophy } from "lucide-react-native";
import { rf } from "@/utils/responsive";
import { VictoryCelebration } from "@/components/VictoryCelebration";
import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";

interface SpinControllerProps {
  isVisible: boolean;
  onClose: () => void;
}

const SpinController: React.FC<SpinControllerProps> = ({
  isVisible,
  onClose,
}) => {
  const {
    status,
    result,
    showVictory,
    spinAnim,
    scaleAnim,
    pulseAnim,
    segments,
    setShowVictory,
    handleSpin,
    reset,
    animateModalIn,
  } = useSpinWheel();

  useEffect(() => {
    if (isVisible) {
      animateModalIn();
    } else {
      reset();
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black/95 justify-center items-center px-6">
        {showVictory && (
          <View className="absolute inset-0 z-50">
            <VictoryCelebration
              type="GOLD"
              intensity="HIGH"
              onComplete={() => setShowVictory(false)}
            />
          </View>
        )}

        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-zinc-950 rounded-[60px] border border-indigo-500/30 w-full max-w-sm items-center pb-10 shadow-2xl"
        >
          <View className="p-8 w-full items-center">
            {/* Header */}
            <View className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6 flex-row items-center">
              <Star size={12} color="#818cf8" fill="#818cf8" />
              <Text className="text-[10px] font-main-bold text-indigo-400 uppercase tracking-[3px] ml-2">
                Imperial Court
              </Text>
            </View>

            <Text
              style={{ fontSize: rf(3.8) }}
              className="text-white font-main-bold text-center tracking-tight"
            >
              {status === "DONE" ? result?.label : "CHOOSE YOUR FATE"}
            </Text>

            {/* 🎡 WHEEL */}
            <View className="relative items-center justify-center my-10">
              {/* Glow */}
              <View className="absolute h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-2xl" />

              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: spinAnim.interpolate({
                        inputRange: [0, 10000], // Increased range to handle multiple spins
                        outputRange: ["0deg", "10000deg"],
                      }),
                    },
                  ],
                }}
                className="w-[300px] h-[300px] rounded-full bg-zinc-900 border-[10px] border-zinc-950 overflow-hidden"
              >
                {segments.map((seg, i) => (
                  <View
                    key={i}
                    className="absolute w-1/2 h-1/2 items-center justify-center border-[0.5px] border-white/10"
                    style={{
                      // Keeping the grid-positioning logic as is since it works
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

              {/* Center Hub */}
              <View className="absolute z-20 w-12 h-12 bg-black rounded-full border-2 border-indigo-500 items-center justify-center shadow-2xl">
                <Trophy size={20} color="#818cf8" />
              </View>

              {/* Pointer */}
              <View className="absolute -top-5 z-30 items-center">
                <View className="w-2 h-12 bg-white rounded-full" />
                <View className="w-5 h-5 bg-indigo-500 rounded-full absolute -top-2 border-2 border-white" />
              </View>
            </View>

            {/* Result */}
            <View className="h-28 justify-center items-center mb-6 px-4">
              {status === "DONE" && result ? (
                <Animated.View
                  style={{ transform: [{ scale: pulseAnim }] }}
                  className="items-center"
                >
                  <Text
                    style={{
                      color: result.color,
                      fontSize: rf(6),
                    }}
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
                  In the court of kings, a single turn can make you a lord or a
                  thief.
                </Text>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={status === "DONE" ? onClose : handleSpin}
              disabled={status === "SPINNING"}
              activeOpacity={0.9}
              className={`w-full py-5 rounded-[22px] items-center border-b-4 ${
                status === "SPINNING"
                  ? "bg-zinc-900 border-zinc-950"
                  : status === "DONE"
                    ? "bg-white border-zinc-300"
                    : "bg-indigo-600 border-indigo-800"
              }`}
            >
              <Text
                className={`font-main-bold text-lg tracking-[2px] ${
                  status === "DONE" ? "text-black" : "text-white"
                }`}
              >
                {status === "SPINNING"
                  ? "LUCK IN MOTION..."
                  : status === "DONE"
                    ? "COLLECT REWARD"
                    : "SPIN THE WHEEL"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(SpinController);
