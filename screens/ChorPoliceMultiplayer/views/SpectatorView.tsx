import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/**
 * Fun Game Waiting Screen
 */

const SPECTATOR_CONFIG: Record<
  string,
  { emoji: string; title: string; message: string; color: string; glow: string }
> = {
  King: {
    emoji: "👑",
    title: "YOU ARE THE KING!",
    message: "Everyone can see you! Watch the fun happen.",
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.35)",
  },
  Thief: {
    emoji: "🦹",
    title: "SUPER STEALTHY",
    message: "Keep it a secret! Don't let anyone spot you.",
    color: "#f87171",
    glow: "rgba(248, 113, 113, 0.35)",
  },
  Advisor: {
    emoji: "🌟",
    title: "TEAM HELPER",
    message: "You're doing great! Keep watching the game.",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.35)",
  },
};

interface Props {
  role: string;
  policeName: string;
  round: number;
}

export const SpectatorView: React.FC<Props> = ({ role, policeName, round }) => {
  const config = SPECTATOR_CONFIG[role] || SPECTATOR_CONFIG.Advisor;

  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1.2, { duration: 1500 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.5,
  }));

  return (
    <View className="flex-1 items-center justify-center bg-slate-900 px-6">
      {/* Floating glow */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: config.glow,
            top: "20%",
          },
          pulseStyle,
        ]}
      />

      {/* Round Badge */}
      <Animated.View entering={FadeIn.duration(300)}>
        <View className="mb-8 rounded-full border border-white/20 bg-white/10 px-6 py-2">
          <Text className="text-xs font-bold tracking-widest text-white">
            ROUND {round}
          </Text>
        </View>
      </Animated.View>

      {/* Main Card */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="w-full max-w-[320px] items-center rounded-3xl border border-white/10 bg-black/40 p-8"
      >
        <Text className="mb-4 text-[60px]">{config.emoji}</Text>

        <Text
          className="text-center text-2xl font-bold"
          style={{ color: config.color }}
        >
          {config.title}
        </Text>

        <Text className="mt-3 text-center text-lg text-white/70">
          {config.message}
        </Text>

        <View className="my-6 h-[1px] w-full bg-white/10" />

        {/* Status */}
        <View className="w-full flex-row items-center rounded-2xl bg-white/5 p-3">
          <Text className="mr-3 text-2xl">🔍</Text>
          <View>
            <Text className="text-sm font-bold text-blue-300">
              {policeName} is playing
            </Text>
            <Text className="text-xs text-white/50">Wait for your turn!</Text>
          </View>
        </View>
      </Animated.View>

      <Text className="mt-10 text-xs font-bold uppercase tracking-widest text-white/30">
        Keep your secret safe!
      </Text>
    </View>
  );
};
