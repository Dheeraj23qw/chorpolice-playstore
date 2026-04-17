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
  const float = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    // main pulse
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.out(Easing.exp),
      }),
      -1,
      false,
    );

    // floating motion
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 1200 }),
      ),
      -1,
      false,
    );

    // breathing container
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 1.4 }],
    opacity: 1 - pulse.value,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value * -10 }],
  }));

  return (
    <View className="items-center justify-center py-12">
      {/* 🔮 BACKGROUND ORBS */}
      <Animated.View
        style={[
          floatStyle,
          {
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: 999,
            backgroundColor: "rgba(99,102,241,0.08)",
            top: 10,
            left: 30,
          },
        ]}
      />

      <Animated.View
        style={[
          floatStyle,
          {
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: 999,
            backgroundColor: "rgba(129,140,248,0.06)",
            bottom: 20,
            right: 40,
          },
        ]}
      />

      {/* 🧠 CORE */}
      <Animated.View style={containerStyle} className="items-center">
        {/* 🔵 MULTI RING SYSTEM */}
        <View className="relative h-28 w-28 items-center justify-center">
          <Animated.View
            style={[
              ringStyle,
              {
                position: "absolute",
                width: 90,
                height: 90,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(129,140,248,0.6)",
              },
            ]}
          />

          <Animated.View
            style={[
              ringStyle,
              {
                position: "absolute",
                width: 110,
                height: 110,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(129,140,248,0.3)",
              },
            ]}
          />

          {/* ICON CORE */}
          <View className="h-20 w-20 items-center justify-center rounded-[34px] border border-white/10 bg-white/[0.04] shadow-xl">
            <Ionicons name="people" size={34} color="#818cf8" />
          </View>
        </View>

        {/* TEXT */}
        <View className="mt-8 items-center">
          <Text className="font-main-bold text-lg uppercase tracking-[6px] text-white">
            Waiting for Friends
          </Text>

          <Text className="font-main-regular mt-1 text-[10px] uppercase tracking-[2px] text-white/30">
            syncing live game state...
          </Text>
        </View>

        {/* DOT MATRIX */}
        <View className="mt-6 flex-row gap-2">
          {[0, 1, 2].map((i) => (
            <Dot key={i} delay={i * 180} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const Dot = ({ delay }: { delay: number }) => {
  const op = useSharedValue(0.2);
  const scale = useSharedValue(1);

  useEffect(() => {
    op.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.2, { duration: 400 }),
        ),
      ),
      -1,
    );

    scale.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1.4, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
      ),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={style}
      className="h-1.5 w-1.5 rounded-full bg-indigo-400"
    />
  );
};
