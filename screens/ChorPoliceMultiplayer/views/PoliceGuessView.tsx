import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

/**
 * Interactive view for the Police player.
 * Shows 2 face-down cards (Thief & Advisor positions) — Police taps to guess.
 * King & Police names are displayed as public info.
 */

interface HiddenPlayer {
  index: number;
  name: string;
  avatarId: number;
}

interface Props {
  hiddenPlayers: HiddenPlayer[];
  policeName: string;
  kingName: string;
  round: number;
  onGuess: (targetIndex: number) => void;
  disabled: boolean;
}

export const PoliceGuessView: React.FC<Props> = ({
  hiddenPlayers,
  policeName,
  kingName,
  round,
  onGuess,
  disabled,
}) => {
  return (
    <View className="flex-1 px-6">
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} className="items-center mt-6 mb-4">
        <View className="rounded-full border border-white/10 bg-white/5 px-5 py-1.5 mb-4">
          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-white/40">
            Round {round} — Your Turn
          </Text>
        </View>

        <Text className="font-main-bold text-xl text-blue-400">
          🚔 You are the Police
        </Text>
        <Text className="font-main-regular text-sm text-white/40 mt-1">
          Tap a card to identify the Thief
        </Text>
      </Animated.View>

      {/* Public roles */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} className="flex-row justify-center gap-4 mb-8">
        <View className="items-center rounded-2xl border border-amber-500/20 bg-amber-500/8 px-5 py-3">
          <Text style={{ fontSize: 24 }}>👑</Text>
          <Text className="font-main-bold text-xs text-amber-400 mt-1">{kingName}</Text>
          <Text className="font-main-regular text-[9px] text-white/30">King</Text>
        </View>
        <View className="items-center rounded-2xl border border-blue-500/20 bg-blue-500/8 px-5 py-3">
          <Text style={{ fontSize: 24 }}>🚔</Text>
          <Text className="font-main-bold text-xs text-blue-400 mt-1">{policeName}</Text>
          <Text className="font-main-regular text-[9px] text-white/30">Police (You)</Text>
        </View>
      </Animated.View>

      {/* Instruction */}
      <Animated.View entering={FadeIn.delay(400).duration(400)} className="items-center mb-6">
        <View className="flex-row items-center rounded-xl bg-red-500/10 border border-red-500/15 px-4 py-2">
          <Ionicons name="finger-print-outline" size={16} color="#f87171" />
          <Text className="font-main-bold text-xs text-red-400 ml-2">
            One of them is the Thief. Choose wisely!
          </Text>
        </View>
      </Animated.View>

      {/* Hidden cards */}
      <View className="flex-row justify-center gap-6">
        {hiddenPlayers.map((player, i) => (
          <Animated.View
            key={player.index}
            entering={ZoomIn.delay(600 + i * 200).duration(400).springify()}
          >
            <Pressable
              onPress={() => !disabled && onGuess(player.index)}
              disabled={disabled}
              style={{
                width: 140,
                height: 200,
                borderRadius: 24,
                backgroundColor: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                borderWidth: 1.5,
                borderColor: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                opacity: disabled ? 0.5 : 1,
              }}
              className="active:scale-95"
            >
              {/* Question mark */}
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "rgba(99, 102, 241, 0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(99, 102, 241, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Text className="font-main-bold text-2xl text-indigo-400">?</Text>
              </View>

              {/* Player name */}
              <Text className="font-main-bold text-sm text-white/60">{player.name}</Text>
              <Text className="font-main-regular text-[10px] text-white/25 mt-1">Tap to guess</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};
