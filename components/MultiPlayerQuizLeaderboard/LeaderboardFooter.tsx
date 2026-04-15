import React, { useEffect } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { Text } from "../Text";

export const LeaderboardFooter = ({
  isHost,
  allFinished,
  isLastRound,
  onNext,
}: any) => {
  const glow = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (allFinished) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1200 }),
          withTiming(1, { duration: 1200 }),
        ),
        -1,
      );
    } else {
      glow.value = 0;
      scale.value = 1;
    }
  }, [allFinished]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      glow.value,
      [0, 1],
      ["rgba(255,255,255,0.04)", "rgba(99,102,241,0.18)"],
    ),
    borderColor: interpolateColor(
      glow.value,
      [0, 1],
      ["rgba(255,255,255,0.08)", "rgba(99,102,241,0.6)"],
    ),
    shadowOpacity: allFinished ? glow.value : 0,
    shadowRadius: 12,
    shadowColor: "#6366F1",
  }));

  if (!isHost) {
    return (
      <View className="items-center py-6">
        <View className="flex-row items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5">
          <Ionicons
            name="hourglass-outline"
            size={14}
            color="rgba(255,255,255,0.5)"
          />
          <Text className="text-[10px] uppercase tracking-[2px] text-white/50">
            Waiting for Host
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="p-6">
      <Animated.View
        style={[
          animatedContainerStyle,
          {
            borderRadius: 999,
            borderWidth: 1,
          },
        ]}
      >
        <Pressable
          onPress={onNext}
          disabled={!allFinished}
          onPressIn={() => {
            scale.value = withSpring(0.97);
          }}
          onPressOut={() => {
            scale.value = withSpring(allFinished ? 1.03 : 1);
          }}
          className="h-14 w-full flex-row items-center justify-center gap-3"
        >
          <Text
            className={`font-main-bold text-sm uppercase tracking-[3px] ${
              allFinished ? "text-white" : "text-white/25"
            }`}
          >
            {isLastRound ? "Back to Lobby" : "Next Round"}
          </Text>

          <Animated.View
            style={useAnimatedStyle(() => ({
              opacity: allFinished ? 1 : 0.3,
              transform: [{ translateX: glow.value * 6 }],
            }))}
          >
            <Ionicons
              name={isLastRound ? "home" : "chevron-forward"}
              size={18}
              color="white"
            />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
};
