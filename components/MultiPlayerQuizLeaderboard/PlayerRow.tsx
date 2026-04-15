import React from "react";
import { View, Pressable, Image } from "react-native";
import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";

export const PlayerRow = ({
  item,
  index,
  round,
  expanded,
  toggleExpand,
  allFinished,
  isMe,
}: any) => {
  const accuracy =
    round > 0 ? Math.round((item.correctCount / round) * 100) : 0;

  const avgTime =
    item.totalTime && round > 0
      ? (item.totalTime / round / 1000).toFixed(1) + "s"
      : "N/A";

  const avatar =
    playerImages[item.avatarId]?.src ||
    require("@/assets/images/chorsipahi/kid1.png");

  return (
    <Pressable
      onPress={() => allFinished && toggleExpand(item.id)}
      className={`mb-3 w-full overflow-hidden rounded-2xl p-3 ${
        isMe ? "bg-indigo-500/10" : "bg-white/[0.02]"
      }`}
    >
      <View className="w-full flex-row items-center justify-between">
        {/* LEFT */}
        <View className="flex-1 flex-row items-center">
          {/* Rank */}
          <Text
            className={`w-8 text-center font-main-bold text-xs ${
              isMe ? "text-indigo-300" : "text-white/40"
            }`}
          >
            #{index + 2}
          </Text>

          {/* Avatar */}
          <View className="ml-2 h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black/20">
            <Image
              source={avatar}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          {/* Name */}
          <View className="ml-3 flex-1">
            <Text
              className="font-main-bold text-[13px] text-white"
              numberOfLines={1}
            >
              {item.name} {isMe && "(You)"}
            </Text>

            <Text
              className={`text-[9px] uppercase tracking-widest ${
                item.isFinished ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {item.isFinished ? "Finished" : "Playing"}
            </Text>
          </View>
        </View>

        {/* RIGHT */}
        <View className="items-end">
          <Text className="font-main-bold text-lg text-white">
            {item.correctCount}
          </Text>
          <Text className="text-[8px] uppercase text-white/30">Points</Text>
        </View>
      </View>

      {/* EXPANDED */}
      {expanded && allFinished && (
        <View className="mt-3 w-full flex-row justify-between px-2 py-3">
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Avg Time" value={avgTime} />
          <Stat label="Correct" value={`${item.correctCount}`} />
        </View>
      )}
    </Pressable>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 items-center">
    <Text className="text-[8px] uppercase tracking-widest text-white/30">
      {label}
    </Text>
    <Text className="mt-1 font-main-bold text-sm text-white">{value}</Text>
  </View>
);
