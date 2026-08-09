import React, { memo, useMemo } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";
import { VictoryCelebration } from "@/components/VictoryCelebration";

interface OfflineResultOverlayProps {
  visible: boolean;
  result: { winner: string; points: number[] } | null;
  players: any[];
  roles: string[];
  currentRound: number;
  totalRounds: number;
  totalScores: number[];
  onNextRound: () => void;
  onPlayAgain: () => void;
}

const OfflineResultOverlayComponent: React.FC<OfflineResultOverlayProps> = ({
  visible,
  result,
  players,
  roles,
  currentRound,
  totalRounds,
  totalScores,
  onNextRound,
  onPlayAgain,
}) => {
  const isFinalRound = useMemo(() => currentRound === totalRounds, [currentRound, totalRounds]);

  // Calculate rankings based on totalScores
  const rankedData = useMemo(() => {
    return players
      .map((p, i) => ({
        ...p,
        role: roles[i],
        roundScore: result?.points[i] || 0,
        totalScore: totalScores[i] || 0,
        originalIndex: i
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [players, roles, result?.points, totalScores]);

  if (!result || !visible) return null;

  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-black"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, alignItems: "center", justifyContent: "center" }}
      >
        {result.winner === "police" && isFinalRound && (
          <VictoryCelebration type="GOLD" intensity="MEDIUM" duration={4000} />
        )}
        <View className="w-full p-6">
          <MotiView
            from={{ scale: 0.9, opacity: 0, translateY: 20 }}
            animate={{ scale: 1, opacity: 1, translateY: 0 }}
            className="rounded-[40px] border border-white/20 bg-white/5"
          >
            <View className="p-8">
            <Text className="mb-2 text-center font-main-bold text-3xl text-white">
              {result.winner === "police" ? "POLICE WON!" : "THIEF ESCAPED!"}
            </Text>
            <Text className="mb-8 text-center uppercase tracking-[3px] text-white/50">Round {currentRound} Leaderboard</Text>

            <View className="gap-y-4">
              {rankedData.map((item, i) => (
                <View key={i} className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <View className="flex-row items-center">
                    <View className="relative">
                        <Image source={playerImages[item.avatarId]?.src || playerImages[1].src} className="mr-3 h-10 w-10 rounded-full" />
                        <View className="absolute -top-1 -left-1 h-5 w-5 items-center justify-center rounded-full bg-indigo-600 border border-white/20">
                            <Text className="font-main-bold text-[8px] text-white">{item.rank}</Text>
                        </View>
                    </View>
                    <View>
                      <Text className="font-main-bold text-white">{item.name || `Player ${item.originalIndex + 1}`}</Text>
                      <Text className="text-[10px] uppercase tracking-widest text-white/40">{item.role || "Unknown"}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-main-bold text-lg text-white">{item.totalScore}</Text>
                    <Text className="text-[8px] uppercase tracking-widest text-indigo-400">+{item.roundScore} Round</Text>
                  </View>
                </View>
              ))}
            </View>

            {isFinalRound ? (
              <View className="mt-10 flex-row">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onPlayAgain}
                  className="mr-3 h-16 flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/10"
                >
                  <Text className="font-main-bold text-lg text-white">
                    Play Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onNextRound}
                  className="h-16 flex-1 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/40"
                >
                  <Text className="font-main-bold text-lg text-white">
                    Back to Home
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onNextRound}
                className="mt-10 h-16 w-full items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/40"
              >
                <Text className="font-main-bold text-lg text-white">
                  Next Round
                </Text>
              </TouchableOpacity>
            )}
            </View>
          </MotiView>
        </View>
      </MotiView>
    </AnimatePresence>
  );
};

export const OfflineResultOverlay = memo(OfflineResultOverlayComponent);
