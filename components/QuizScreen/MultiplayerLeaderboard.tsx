import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";
import { playerImages } from "@/constants/playerData";

interface MultiplayerLeaderboardProps {
  round: number;
  data: any[];
  roundProgress: Record<string, any>;
  onNext: () => void;
  isHost: boolean;
  isLastRound: boolean;
  totalPot: number;
  timeLeft: number;
  localPlayerId?: string;
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
  localPlayerId,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData ? imgData.src : require("@/assets/images/chorsipahi/kid1.png");
  };

  const allFinished = !!(data && data.length > 0);

  // Use final data if available, otherwise live progress
  const players = allFinished
    ? data.map((d: any) => ({
        id: d.id,
        name: d.name,
        correctCount: d.correctCount,
        totalTime: d.totalTime || 0,
        avatarId: d.avatarId,
        isFinished: true,
      }))
    : Object.values(roundProgress).sort((a: any, b: any) => b.correctCount - a.correctCount);

  const winner = allFinished && players.length > 0 ? players[0] : null;
  const others = allFinished ? players.slice(1) : players;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getAccuracy = (player: any) => {
    if (!allFinished || round === 0) return 0;
    return Math.round((player.correctCount / round) * 100);
  };

  const getAvgTime = (player: any) => {
    if (!allFinished || round === 0 || !player.totalTime) return "N/A";
    const avg = player.totalTime / round / 1000;
    return `${avg.toFixed(1)}s`;
  };

  const isMe = (id: string) => id === localPlayerId;

  return (
    <View className="flex-1 px-4">
      <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">

        {/* ── HEADER ── */}
        <View className="bg-indigo-600/15 px-6 pt-6 pb-4 items-center">
          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-white/40">
            {isLastRound ? "🏆 Final Results" : `Round ${round} of 7`}
          </Text>
        </View>

        {/* ── WINNER CIRCLE ── */}
        {winner && allFinished && (
          <View className="items-center pb-4 -mt-1">
            {/* Big circular avatar */}
            <View className="h-20 w-20 rounded-full items-center justify-center overflow-hidden border-[3px] border-yellow-400/60 bg-white/10">
              <Image
                source={getAvatarSource(winner.avatarId)}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>

            {/* Winner badge */}
            <View className="mt-2 rounded-full bg-yellow-400/15 border border-yellow-400/30 px-4 py-1">
              <Text className="font-main-bold text-[10px] uppercase tracking-widest text-yellow-400">
                🥇 {winner.name}
              </Text>
            </View>

            {/* Score */}
            <Text className="mt-1 font-main-bold text-2xl text-white">
              {winner.correctCount}/{round}
            </Text>
            <Text className="font-main-regular text-[9px] uppercase text-white/30 tracking-widest">
              Correct Answers
            </Text>

            {/* Pot congratulations */}
            {isLastRound && totalPot > 0 && (
              <View className="mt-3 rounded-2xl bg-green-500/10 border border-green-500/20 px-5 py-2">
                <Text className="font-main-bold text-[11px] text-green-400 text-center">
                  🎉 Congratulations! Won {totalPot} Coins!
                </Text>
              </View>
            )}

            {/* Expandable stats for winner */}
            <Pressable
              onPress={() => toggleExpand(winner.id)}
              className="mt-2"
            >
              <Text className="text-[9px] uppercase text-indigo-400 font-main-bold tracking-widest">
                {expandedId === winner.id ? "Hide Stats ▲" : "View Stats ▼"}
              </Text>
            </Pressable>

            {expandedId === winner.id && (
              <View className="mt-2 rounded-2xl border border-white/5 bg-white/5 px-5 py-3 flex-row justify-around w-[80%]">
                <View className="items-center">
                  <Text className="font-main-bold text-sm text-white">{getAccuracy(winner)}%</Text>
                  <Text className="text-[7px] uppercase text-white/30">Accuracy</Text>
                </View>
                <View className="items-center">
                  <Text className="font-main-bold text-sm text-white">{getAvgTime(winner)}</Text>
                  <Text className="text-[7px] uppercase text-white/30">Avg Time</Text>
                </View>
                <View className="items-center">
                  <Text className="font-main-bold text-sm text-white">{winner.correctCount}</Text>
                  <Text className="text-[7px] uppercase text-white/30">Correct</Text>
                </View>
              </View>
            )}

            {isMe(winner.id) && (
              <View className="mt-2 rounded-full bg-indigo-500/15 border border-indigo-500/20 px-3 py-1">
                <Text className="font-main-bold text-[8px] uppercase tracking-widest text-indigo-400">
                  That's You! 🎯
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── WAITING STATE (no summary yet) ── */}
        {!allFinished && (
          <View className="items-center py-6">
            <Ionicons name="hourglass-outline" size={28} color="#818cf8" />
            <Text className="mt-2 font-main-bold text-base text-white">
              Waiting for Friends...
            </Text>
          </View>
        )}

        {/* ── Divider ── */}
        {allFinished && others.length > 0 && (
          <View className="mx-6 h-[1px] bg-white/5" />
        )}

        {/* ── OTHER PLAYERS LIST ── */}
        <ScrollView
          className="max-h-[220px]"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {others.map((item: any, index: number) => {
            const rank = index + 2; // +2 because winner is #1
            const medal = rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
            const isExpanded = expandedId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => allFinished && toggleExpand(item.id)}
                className={`mb-3 rounded-2xl border p-3 ${
                  isMe(item.id) ? "border-indigo-500/20 bg-indigo-500/5" : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {/* Rank */}
                    <View className="w-7 items-center">
                      {medal ? (
                        <Text style={{ fontSize: 16 }}>{medal}</Text>
                      ) : (
                        <Text className="font-main-bold text-xs text-white/25">#{rank}</Text>
                      )}
                    </View>

                    {/* Avatar */}
                    <View className="ml-2 h-9 w-9 rounded-full items-center justify-center overflow-hidden bg-white/10 border border-white/5">
                      <Image
                        source={getAvatarSource(item.avatarId)}
                        className="w-7 h-7"
                        resizeMode="contain"
                      />
                    </View>

                    {/* Name & status */}
                    <View className="ml-3 flex-1">
                      <Text className="font-main-bold text-[12px] text-white" numberOfLines={1}>
                        {item.name} {isMe(item.id) ? "(You)" : ""}
                      </Text>
                      <Text className={`text-[8px] uppercase font-main-md tracking-widest ${
                        item.isFinished ? "text-green-400" : "text-yellow-400"
                      }`}>
                        {item.isFinished ? "✅ Done" : "🤔 Thinking..."}
                      </Text>
                    </View>
                  </View>

                  {/* Score */}
                  <View className="items-end">
                    <Text className="font-main-bold text-base text-white">
                      {item.correctCount}
                    </Text>
                    <Text className="font-main-regular text-[7px] text-white/25 uppercase">
                      Correct
                    </Text>
                  </View>
                </View>

                {/* Expanded Stats */}
                {isExpanded && allFinished && (
                  <View className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 flex-row justify-around">
                    <View className="items-center">
                      <Text className="font-main-bold text-sm text-white">{getAccuracy(item)}%</Text>
                      <Text className="text-[7px] uppercase text-white/30">Accuracy</Text>
                    </View>
                    <View className="items-center">
                      <Text className="font-main-bold text-sm text-white">{getAvgTime(item)}</Text>
                      <Text className="text-[7px] uppercase text-white/30">Avg Time</Text>
                    </View>
                    <View className="items-center">
                      <Text className="font-main-bold text-sm text-white">{item.correctCount}</Text>
                      <Text className="text-[7px] uppercase text-white/30">Correct</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── FOOTER ── */}
        <View className="p-5">
          {isHost ? (
            <TouchableOpacity
              onPress={onNext}
              disabled={!allFinished}
              activeOpacity={0.8}
              className={`w-full items-center justify-center rounded-2xl py-4 ${
                allFinished ? "bg-indigo-600" : "bg-white/10 opacity-50"
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
            <View className="w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-4">
              <Text className="font-main-bold text-[11px] uppercase tracking-widest text-white/50">
                {allFinished ? "⏳ Host is choosing..." : "⏳ Waiting for friends..."}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
