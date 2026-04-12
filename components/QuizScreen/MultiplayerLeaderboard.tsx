import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";
import { playerImages } from "@/constants/playerData";

interface PlayerStatus {
  id: string;
  name: string;
  isFinished: boolean;
  correctCount: number;
  avatarId: number;
}

interface MultiplayerLeaderboardProps {
  round: number;
  data: any[]; // Final summary from TC_ROUND_SUMMARY
  roundProgress: Record<string, PlayerStatus>; // Live progress
  onNext: () => void;
  isHost: boolean;
  isLastRound: boolean;
  totalPot: number;
  timeLeft: number;
}

export const MultiplayerLeaderboard: React.FC<MultiplayerLeaderboardProps> = ({
  round,
  data,
  roundProgress,
  onNext,
  isHost,
  isLastRound,
  totalPot,
  timeLeft,
}) => {
  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData ? imgData.src : require("@/assets/images/chorsipahi/kid1.png");
  };

  /**
   * BUG FIX: `allFinished` was computed from `roundProgress` which can have
   * stale entries. The AUTHORITATIVE signal is `data` (TC_ROUND_SUMMARY).
   * If `data` exists and has entries, ALL players are done — that's the
   * entire contract of the round summary packet.
   */
  const allFinished = !!(data && data.length > 0);

  // Use final leaderboard data if available, otherwise fall back to live progress
  const displayItems = allFinished
    ? data.map((d: any) => ({
        id: d.id,
        name: d.name,
        isFinished: true,
        correctCount: d.correctCount,
        avatarId: d.avatarId,
      }))
    : Object.values(roundProgress).sort((a, b) => b.correctCount - a.correctCount);

  // Medal emojis for kids
  const getMedal = (index: number) => {
    if (!allFinished) return null;
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 px-4"
    >
      <View className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-3xl">
        {/* Header */}
        <View className="bg-indigo-600/20 px-6 py-6 items-center">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 mb-3">
            <Ionicons
              name={allFinished ? "trophy" : "hourglass-outline"}
              size={24}
              color={allFinished ? "#fbbf24" : "#818cf8"}
            />
          </View>
          <Text className="font-main-bold text-[10px] uppercase tracking-[5px] text-white/40">
            {isLastRound ? "🏆 Final Results" : `Round ${round} of 7`}
          </Text>
          <Text className="mt-1 font-main-bold text-lg text-white uppercase text-center">
            {allFinished
              ? isLastRound ? "Game Over!" : "Everyone's Done! ✨"
              : "Waiting for Friends..."}
          </Text>

          {totalPot > 0 && (
            <View className="mt-3 flex-row items-center rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1">
              <Text className="font-main-bold text-[10px] text-green-400 uppercase tracking-widest">
                💰 Prize: {totalPot} Coins
              </Text>
            </View>
          )}
        </View>

        {/* Player List */}
        <ScrollView
          className="max-h-[350px]"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {displayItems.map((item, index) => {
            const isWinner = index === 0 && allFinished;
            const medal = getMedal(index);
            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 300, delay: index * 80 }}
                className={`mb-4 flex-row items-center justify-between rounded-3xl border p-4 ${
                  isWinner ? "bg-indigo-600/10 border-indigo-500/30" : "bg-white/5 border-white/5"
                }`}
              >
                <View className="flex-row items-center flex-1">
                  {/* Rank / Medal */}
                  <View className="w-8 items-center">
                    {medal ? (
                      <Text style={{ fontSize: 20 }}>{medal}</Text>
                    ) : (
                      <Text className="font-main-bold text-sm text-white/30">
                        #{index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Avatar */}
                  <View className="ml-2 h-10 w-10 items-center justify-center rounded-xl bg-white/10 overflow-hidden border border-white/5">
                    <Image
                      source={getAvatarSource(item.avatarId)}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                  </View>

                  {/* Name & Status */}
                  <View className="ml-3 flex-1">
                    <Text className="font-main-bold text-[13px] text-white" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.isFinished ? (
                      <Text className="text-[9px] uppercase text-green-400 font-main-md tracking-widest">
                        ✅ Done
                      </Text>
                    ) : (
                      <MotiView
                        from={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ loop: true, type: "timing", duration: 800 }}
                      >
                        <Text className="text-[9px] uppercase text-yellow-400 font-main-md tracking-widest">
                          🤔 Thinking...
                        </Text>
                      </MotiView>
                    )}
                  </View>
                </View>

                {/* Score */}
                <View className="items-end">
                  <Text className={`font-main-bold text-lg ${isWinner ? "text-indigo-400" : "text-white"}`}>
                    {item.correctCount}
                  </Text>
                  <Text className="font-main-regular text-[8px] text-white/30 uppercase">
                    Correct
                  </Text>
                </View>
              </MotiView>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View className="p-6">
          {isHost ? (
            <TouchableOpacity
              onPress={onNext}
              disabled={!allFinished}
              activeOpacity={0.8}
              className={`w-full items-center justify-center rounded-3xl py-4 shadow-lg ${
                allFinished ? "bg-indigo-600 shadow-indigo-600/40" : "bg-white/10 opacity-50"
              }`}
            >
              <Text className="font-main-bold text-sm uppercase tracking-widest text-white">
                {!allFinished
                  ? "⏳ Waiting..."
                  : isLastRound
                    ? "🏠 Back to Lobby"
                    : "Next Round →"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-4">
              <Text className="font-main-bold text-[11px] uppercase tracking-widest text-white/50">
                {allFinished ? "⏳ Host is choosing..." : "⏳ Waiting for friends..."}
              </Text>
            </View>
          )}
        </View>
      </View>
    </MotiView>
  );
};
