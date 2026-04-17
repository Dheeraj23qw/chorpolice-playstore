import React from "react";
import { View, TouchableOpacity } from "react-native";
import { rf, hp } from "@/utils/responsive";
import { Text } from "../Text";
import { WaitingState } from "../MultiPlayerQuizLeaderboard/WaitingState";

type QuizOptionsProps = {
  playerName: string;
  options: number[];
  onOptionPress: (score: number) => void;
  isActivePlayer: boolean;
};

const QuizOptions: React.FC<QuizOptionsProps> = ({
  playerName,
  options,
  onOptionPress,
  isActivePlayer,
}) => {
  const handleOptionPress = (score: number) => {
    if (!isActivePlayer) return;
    onOptionPress(score);
  };

  // 🕒 FULL REPLACEMENT STATE
  if (!isActivePlayer) {
    return (
      <>
        <View className="mb-8 items-center">
          <Text
            style={{ fontSize: rf(2.1) }}
            className="text-center font-main-bold tracking-wide text-white/90"
          >
            <Text className="font-main-bold text-indigo-400">{playerName}</Text>
            {" guess your score ✨"}
          </Text>
        </View>
        <WaitingState />
      </>
    );
  }

  return (
    <View className="w-full px-5">
      {/* Header */}
      <View className="mb-8 items-center">
        <Text
          style={{ fontSize: rf(2.1) }}
          className="text-center font-main-bold tracking-wide text-white/90"
        >
          <Text className="font-main-bold text-indigo-400">{playerName}</Text>
          {" guess your score ✨"}
        </Text>
      </View>

      {/* OPTIONS */}
      <View>
        {options.map((score, index) => (
          <TouchableOpacity
            key={`${playerName}-${index}`}
            activeOpacity={0.85}
            onPress={() => handleOptionPress(score)}
            style={{
              marginBottom: hp(2.4),
              minHeight: hp(9),
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 18,
              elevation: 6,
            }}
            className="w-full items-center justify-center rounded-[36px] border border-white/20 bg-white/[0.10]"
          >
            <Text
              style={{ fontSize: rf(3.4) }}
              className="font-main-bold tracking-wider text-white"
            >
              {score}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default React.memo(QuizOptions);