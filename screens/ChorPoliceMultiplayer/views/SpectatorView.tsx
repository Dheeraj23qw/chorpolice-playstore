import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

/**
 * Spectator / waiting view for non-Police players during the police_turn phase.
 * King sees "watching the investigation", Thief sees "stay hidden", Advisor sees "waiting quietly".
 */

const SPECTATOR_CONFIG: Record<string, { emoji: string; title: string; message: string; color: string }> = {
  King: {
    emoji: "👑",
    title: "You are the King",
    message: "Watch the Police investigate. Your identity is known to everyone.",
    color: "#fbbf24",
  },
  Thief: {
    emoji: "🦹",
    title: "You are the Thief",
    message: "Stay hidden! The Police is trying to find you...",
    color: "#f87171",
  },
  Advisor: {
    emoji: "🧠",
    title: "You are the Advisor",
    message: "Your identity is hidden. The Police is investigating...",
    color: "#a78bfa",
  },
};

interface Props {
  role: string;
  policeName: string;
  round: number;
}

export const SpectatorView: React.FC<Props> = ({ role, policeName, round }) => {
  const config = SPECTATOR_CONFIG[role] || SPECTATOR_CONFIG.Advisor;

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Round */}
      <Animated.View entering={FadeIn.duration(300)}>
        <View className="rounded-full border border-white/10 bg-white/5 px-5 py-1.5 mb-8">
          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-white/40">
            Round {round}
          </Text>
        </View>
      </Animated.View>

      {/* Role emoji */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>{config.emoji}</Text>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text className="font-main-bold text-2xl" style={{ color: config.color }}>
          {config.title}
        </Text>
      </Animated.View>

      {/* Message */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mt-4 max-w-[260px]">
        <Text className="text-center font-main-regular text-sm leading-5 text-white/40">
          {config.message}
        </Text>
      </Animated.View>

      {/* Police investigating indicator */}
      <Animated.View
        entering={FadeIn.delay(500).duration(400)}
        className="mt-10 flex-row items-center rounded-2xl border border-blue-500/15 bg-blue-500/8 px-5 py-3"
      >
        <Text style={{ fontSize: 18 }}>🔍</Text>
        <View className="ml-3">
          <Text className="font-main-bold text-xs text-blue-400">
            {policeName} is investigating...
          </Text>
          <Text className="font-main-regular text-[10px] text-white/30 mt-0.5">
            Waiting for the Police to make a guess
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};
