import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

/**
 * Round result view — shows all revealed roles, whether Police guessed correctly,
 * and a score table for all players.
 */

interface RoleInfo {
  playerIndex: number;
  playerId: string;
  playerName: string;
  role: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId: number;
  totalScore: number;
  roundScores: number[];
}

interface Props {
  correct: boolean;
  allRoles: RoleInfo[];
  leaderboard: LeaderboardEntry[];
  round: number;
  isLastRound: boolean;
  localPlayerId: string;
  onNextRound: () => void;
  isHost: boolean;
}

const ROLE_EMOJI: Record<string, string> = {
  King: "👑",
  Police: "🚔",
  Thief: "🦹",
  Advisor: "🧠",
};

const ROLE_COLOR: Record<string, string> = {
  King: "#fbbf24",
  Police: "#60a5fa",
  Thief: "#f87171",
  Advisor: "#a78bfa",
};

export const RoundResultView: React.FC<Props> = ({
  correct,
  allRoles,
  leaderboard,
  round,
  isLastRound,
  localPlayerId,
  onNextRound,
  isHost,
}) => {
  return (
    <View className="flex-1 px-6">
      {/* Result banner */}
      <Animated.View entering={ZoomIn.duration(400).springify()} className="items-center mt-8 mb-6">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: correct ? "rgba(16,185,129,0.12)" : "rgba(248,113,113,0.12)",
            borderWidth: 1.5,
            borderColor: correct ? "rgba(16,185,129,0.25)" : "rgba(248,113,113,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={correct ? "checkmark-circle" : "close-circle"}
            size={40}
            color={correct ? "#34d399" : "#f87171"}
          />
        </View>
        <Text
          className="font-main-bold text-xl mt-3"
          style={{ color: correct ? "#34d399" : "#f87171" }}
        >
          {correct ? "Police caught the Thief!" : "Thief escaped!"}
        </Text>
        <Text className="font-main-regular text-xs text-white/30 mt-1">Round {round}</Text>
      </Animated.View>

      {/* All roles revealed */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mb-6">
        <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-white/30 mb-3 ml-1">
          Roles Revealed
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {allRoles.map((info, i) => (
            <Animated.View
              key={info.playerId}
              entering={FadeIn.delay(400 + i * 100).duration(300)}
              style={{
                width: "48%",
                marginBottom: 8,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.03)",
                borderWidth: 1,
                borderColor: `${ROLE_COLOR[info.role]}30`,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 10 }}>{ROLE_EMOJI[info.role]}</Text>
              <View className="flex-1">
                <Text
                  className="font-main-bold text-sm"
                  style={{ color: info.playerId === localPlayerId ? "#818cf8" : "rgba(255,255,255,0.7)" }}
                  numberOfLines={1}
                >
                  {info.playerName}
                  {info.playerId === localPlayerId ? " (You)" : ""}
                </Text>
                <Text
                  className="font-main-regular text-[10px]"
                  style={{ color: ROLE_COLOR[info.role] }}
                >
                  {info.role}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Leaderboard */}
      <Animated.View entering={FadeInDown.delay(600).duration(400)} className="mb-6">
        <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-white/30 mb-3 ml-1">
          Leaderboard
        </Text>
        <View className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          {leaderboard.map((entry, i) => (
            <View
              key={entry.id}
              className="flex-row items-center px-4 py-3"
              style={{
                borderBottomWidth: i < leaderboard.length - 1 ? 1 : 0,
                borderBottomColor: "rgba(255,255,255,0.05)",
                backgroundColor: entry.id === localPlayerId ? "rgba(99,102,241,0.06)" : "transparent",
              }}
            >
              {/* Rank */}
              <Text className="font-main-bold text-sm text-white/20 w-6">{i + 1}</Text>

              {/* Name */}
              <Text
                className="font-main-bold text-sm flex-1"
                style={{ color: entry.id === localPlayerId ? "#818cf8" : "rgba(255,255,255,0.6)" }}
                numberOfLines={1}
              >
                {entry.name}
                {entry.id === localPlayerId ? " (You)" : ""}
              </Text>

              {/* Last round score */}
              <Text className="font-main-regular text-xs text-white/20 mr-3">
                +{entry.roundScores[entry.roundScores.length - 1] || 0}
              </Text>

              {/* Total */}
              <Text className="font-main-bold text-sm text-indigo-400">{entry.totalScore}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Next round button (host only) */}
      {isHost && !isLastRound && (
        <Animated.View entering={FadeIn.delay(800).duration(400)} className="items-center mt-2">
          <Pressable
            onPress={onNextRound}
            className="w-full h-[52px] rounded-2xl bg-indigo-600 items-center justify-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <Ionicons name="play-outline" size={18} color="white" />
              <Text className="font-main-bold text-base text-white ml-2">Next Round</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {isLastRound && (
        <Animated.View entering={FadeIn.delay(800).duration(400)} className="items-center mt-2">
          <View className="rounded-2xl bg-amber-500/10 border border-amber-500/20 px-6 py-3">
            <Text className="font-main-bold text-sm text-amber-400 text-center">
              🏆 Game Over — Final Scores Above
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};
