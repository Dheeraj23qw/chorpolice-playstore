import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  withDelay,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";

export const WaitingState = () => {
  const pulse = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Synchronized pulse for the background rings
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value }],
    opacity: 1 - pulse.value,
  }));

  return (
    <View className="items-center justify-center py-12">
      {/* ── Visual Pulse Anchor ── */}
      <View className="relative h-24 w-24 items-center justify-center">
        {/* Animated Ring 1 */}
        <Animated.View
          style={[
            animatedRingStyle,
            {
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 1,
              borderColor: "#818cf8",
            },
          ]}
        />

        {/* Central Icon Container */}
        <View className="h-20 w-20 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.03] shadow-lg">
          <Ionicons name="people" size={32} color="#818cf8" />
        </View>
      </View>

      {/* ── Status Text ── */}
      <View className="mt-8 items-center">
        <Text className="font-main-bold text-lg uppercase tracking-[6px] text-white">
          Waiting for Friends
        </Text>
        <Text className="font-main-regular mt-1 text-[10px] uppercase tracking-[2px] text-white/30">
          Syncing lobby status...
        </Text>
      </View>

      {/* ── Advanced Progress Dots ── */}
      <View className="mt-6 flex-row gap-2">
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  );
};

const Dot = ({ delay }: { delay: number }) => {
  const op = useSharedValue(0.2);
  useEffect(() => {
    op.value = withRepeat(
      withDelay(delay, withTiming(1, { duration: 600 })),
      -1,
      true,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View
      style={style}
      className="h-1.5 w-1.5 rounded-full bg-indigo-500"
    />
  );
};
