import React, { useEffect, useRef } from "react";
import { Modal, TouchableOpacity, View, Animated, Easing } from "react-native";
import { Text } from "@/components/Text";
import { Coins } from "lucide-react-native";

interface CoinsRewardModalProps {
  visible: boolean;
  amount: number;
  onClaim: () => void;
}

export default function CoinsRewardModal({
  visible,
  amount,
  onClaim,
}: CoinsRewardModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isLoss = amount < 0;
  const absoluteAmount = Math.abs(amount);

  // Dynamic Theme
  const theme = isLoss
    ? {
        color: "#ef4444",
        bg: "bg-red-500",
        glow: "bg-red-400/30",
        label: "Coins Lost",
        message: "Better luck next time! Keep practicing.",
      }
    : {
        color: "#facc15",
        bg: "bg-yellow-500",
        glow: "bg-yellow-400/30",
        label: "Reward Earned",
        message: "Great job! You earned coins for completing this round.",
      };

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(onClaim);
  };

  return (
    <Modal transparent visible animationType="none">
      <View className="flex-1 items-center justify-center bg-black/80 p-6">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm items-center"
        >
          {/* Rotating Glow */}
          <Animated.View
            style={{ transform: [{ rotate: spin }] }}
            className="absolute -top-10 h-80 w-80 opacity-20"
          >
            <View
              className={`absolute h-full w-full rounded-full ${theme.glow}`}
            />
          </Animated.View>

          {/* Main Card */}
          <View className="w-full items-center rounded-[40px] border-4 border-white/20 bg-[#111827] p-8 shadow-2xl">
            {/* Icon */}
            <View className="absolute -top-14 self-center">
              <View className="rounded-full bg-[#111827] p-3 border-4 border-white/10 shadow-xl">
                <View
                  className={`h-28 w-28 items-center justify-center rounded-full ${theme.bg} shadow-lg`}
                >
                  <Coins size={56} color="white" strokeWidth={2.5} />
                </View>
              </View>
            </View>

            <View className="mt-16 items-center">
              <Text className="text-xs font-main-bold uppercase tracking-widest text-white/50">
                {theme.label}
              </Text>

              <Text
                style={{ color: theme.color }}
                className="mt-2 text-4xl font-main-bold"
              >
                {isLoss ? "-" : "+"}
                {absoluteAmount}
              </Text>

              <Text
                style={{ color: theme.color }}
                className="mt-1 text-lg font-main-bold"
              >
                Coins
              </Text>

              <View className="my-4 h-[2px] w-12 bg-white/10" />

              <Text className="text-center text-slate-400 font-main-md">
                {theme.message}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClose}
              className={`mt-8 w-full overflow-hidden rounded-2xl py-4 shadow-lg ${theme.bg}`}
            >
              <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/20" />
              <Text className="text-center text-lg font-main-bold uppercase tracking-wide text-white">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
