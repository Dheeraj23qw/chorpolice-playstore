import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/Text";

interface CoinBalanceRowProps {
  coins: number;
  accuracyBonus: number;
  betAmount: number;
  isWinner: boolean;
}

export default function CoinBalanceRow({
  coins,
  accuracyBonus,
  betAmount,
  isWinner,
}: CoinBalanceRowProps) {
  const pulse = useSharedValue(1);
  const coinBob = useSharedValue(0);
  const pop = useSharedValue(1);

  const rawMatchEarning = isWinner ? betAmount * 3 : -betAmount;
  const matchEarning = Object.is(rawMatchEarning, -0) ? 0 : rawMatchEarning;

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 1100 }),
        withTiming(1, { duration: 1100 }),
      ),
      -1,
      true,
    );

    coinBob.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    pop.value = withSequence(
      withSpring(1.08, {
        damping: 9,
        stiffness: 260,
      }),
      withSpring(1, {
        damping: 12,
        stiffness: 180,
      }),
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + 0.15 * pulse.value,
    transform: [
      { translateY: -1 * coinBob.value },
      { scale: 1 + 0.006 * coinBob.value },
    ],
  }));

  const coinStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: 0.95 + 0.05 * coinBob.value,
      },
    ],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  return (
    <Animated.View style={containerStyle} className="mt-4 w-full items-center">
      <View className="w-full max-w-[380px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.045] px-1 py-1">
        <View className="flex-row items-stretch">
          {/* COINS */}
          <View className="flex-1 items-center justify-center px-1 py-3">
            <Text className="mb-1 text-center font-main-bold text-[8px] uppercase tracking-[1px] text-yellow-400/60">
              Coins
            </Text>

            <View className="flex-row items-center justify-center">
              <Animated.View style={coinStyle}>
                <Text className="mr-1 text-sm">🪙</Text>
              </Animated.View>

              <Animated.View style={numberStyle}>
                <Text className="font-main-bold text-lg text-yellow-300">
                  {coins.toLocaleString()}
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* DIVIDER */}
          <View className="my-3 w-px bg-white/10" />

          {/* ACCURACY BONUS */}
          <View className="flex-1 items-center justify-center px-1 py-3">
            <Text className="mb-1 text-center font-main-bold text-[8px] uppercase tracking-[1px] text-blue-400/60">
              Accuracy Bonus
            </Text>

            <Animated.View style={numberStyle}>
              <Text
                className={`font-main-bold text-lg ${
                  accuracyBonus > 0
                    ? "text-blue-300"
                    : accuracyBonus < 0
                      ? "text-red-300"
                      : "text-white/50"
                }`}
              >
                {accuracyBonus > 0 ? "+" : ""}
                {accuracyBonus.toLocaleString()}
              </Text>
            </Animated.View>
          </View>

          {/* DIVIDER */}
          <View className="my-3 w-px bg-white/10" />

          {/* MATCH EARNING */}
          <View className="flex-1 items-center justify-center px-1 py-3">
            <Text
              className={`mb-1 text-center font-main-bold text-[8px] uppercase tracking-[1px] ${
                isWinner ? "text-emerald-400/60" : "text-red-400/60"
              }`}
            >
              Match Earning
            </Text>

            <Animated.View style={numberStyle}>
              <Text
                className={`font-main-bold text-lg ${
                  matchEarning > 0
                    ? "text-emerald-300"
                    : matchEarning < 0
                      ? "text-red-300"
                      : "text-white/50"
                }`}
              >
                {matchEarning > 0 ? "+" : ""}
                {matchEarning.toLocaleString()}
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
