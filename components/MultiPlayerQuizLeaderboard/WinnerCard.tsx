import React from "react";
import { View, Image } from "react-native";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";

export const WinnerCard = ({
  winner,
  round,
  totalPot,
  isLastRound,
  isMe,
  getAvatarSource,
}: any) => {
  const accuracy =
    round > 0 ? Math.round((winner.correctCount / round) * 100) : 0;

  const avgTime = winner.totalTime
    ? (winner.totalTime / round / 1000).toFixed(1) + "s"
    : "N/A";

  return (
    <View className="w-full items-center px-2 py-4">
      <View className="relative mb-4 items-center justify-center">
        <View className="absolute h-40 w-40 rounded-full bg-yellow-400/20 blur-2xl" />

        <View className="h-32 w-32 items-center justify-center rounded-full border-[5px] border-white/20 bg-white/[0.05] backdrop-blur-md">
          <View className="h-28 w-28 overflow-hidden rounded-full border-[3px] border-yellow-400/50">
            <Image
              source={getAvatarSource(winner.avatarId)}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        </View>

        <View className="absolute -bottom-2 rounded-full bg-yellow-400 px-4 py-[3px]">
          <Text className="font-main-bold text-[9px] uppercase tracking-[2px] text-black">
            WINNER
          </Text>
        </View>
      </View>

      <Text className="font-main-bold text-lg text-white">{winner.name}</Text>

      <View className="mt-1 flex-row items-end">
        <Text className="font-main-bold text-3xl text-white">
          {winner.correctCount}
        </Text>
        <Text className="ml-1 text-base text-white/30">/ {round}</Text>
      </View>

      <Text className="mt-1 text-[8px] uppercase tracking-[3px] text-white/40">
        Correct Answers
      </Text>

      <View className="mt-4 w-full flex-row justify-between px-4 py-3">
        <StatItem label="Accuracy" value={`${accuracy}%`} />
        <StatItem label="Avg Time" value={avgTime} />
        <StatItem label="Rank" value="#1" />
      </View>

      {isLastRound && totalPot > 0 && (
        <View className="mt-3 flex-row items-center px-3 py-1">
          <Ionicons name="trophy" size={14} color="#4ade80" />
          <Text className="ml-2 font-main-bold text-[10px] tracking-widest text-green-400">
            WON {totalPot}
          </Text>
        </View>
      )}

      {isMe && (
        <View className="mt-3 px-3 py-1">
          <Text className="font-main-bold text-[9px] uppercase tracking-[2px] text-indigo-400">
            That&apos;s You
          </Text>
        </View>
      )}
    </View>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 items-center">
    <Text className="font-main-bold text-sm text-white">{value}</Text>
    <Text className="mt-1 text-[7px] uppercase tracking-[2px] text-white/30">
      {label}
    </Text>
  </View>
);
