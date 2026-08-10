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
  hasGuessed?: boolean;
  isTargetPlayer?: boolean;
};

const QuizOptions: React.FC<QuizOptionsProps> = ({
  playerName,
  options,
  onOptionPress,
  isActivePlayer,
  hasGuessed = false,
  isTargetPlayer = false,
}) => {
  const handleOptionPress = (score: number) => {
    if (!isActivePlayer || hasGuessed || isTargetPlayer) return;
    onOptionPress(score);
  };

  // 1. TARGET PLAYER UI (Options Disabled, Target Message)
  if (isTargetPlayer) {
    return (
      <View className="w-full px-5">
        <View className="mb-6 items-center">
          <Text
            style={{ fontSize: rf(1.4) }}
            className="font-main-bold uppercase tracking-[3px] text-amber-400 mb-1"
          >
            YOUR SCORE
          </Text>
          <Text
            style={{ fontSize: rf(2.0) }}
            className="text-center font-main-bold tracking-wide text-white/90"
          >
            Other players are guessing your score!
          </Text>
        </View>

        {/* Disabled Options Display for Target */}
        <View className="opacity-40 mb-4">
          {options.map((score, index) => (
            <View
              key={`target-opt-${index}`}
              style={{
                marginBottom: hp(1.4),
                minHeight: hp(7.0),
              }}
              className="w-full items-center justify-center rounded-[36px] border border-white/20 bg-white/[0.05]"
            >
              <Text
                style={{ fontSize: rf(2.8) }}
                className="font-main-bold tracking-wider text-white/50"
              >
                {score.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <WaitingState />
      </View>
    );
  }

  // 2. GUESSER HAS ALREADY SUBMITTED (Post-Guess Waiting State)
  if (hasGuessed) {
    return (
      <View className="w-full px-5">
        <View className="mb-6 items-center">
          <Text
            style={{ fontSize: rf(1.4) }}
            className="font-main-bold uppercase tracking-[3px] text-indigo-400 mb-1"
          >
            🕵️ GUESS THE SCORE
          </Text>
          <Text
            style={{ fontSize: rf(2.0) }}
            className="text-center font-main-bold tracking-wide text-white/90"
          >
            Guess submitted! Waiting for others...
          </Text>
        </View>
        <WaitingState />
      </View>
    );
  }

  // 3. GUESSER ACTIVE SELECTION UI
  return (
    <View className="w-full px-5">
      {/* Header */}
      <View className="mb-6 items-center">
        <Text
          style={{ fontSize: rf(1.4) }}
          className="font-main-bold uppercase tracking-[3px] text-indigo-400 mb-1"
        >
          🕵️ GUESS THE SCORE
        </Text>
        <Text
          style={{ fontSize: rf(2.0) }}
          className="text-center font-main-bold tracking-wide text-white/90"
        >
          What do you think <Text className="font-main-bold text-indigo-400">{playerName}</Text>&apos;s score is?
        </Text>
      </View>

      {/* OPTIONS */}
      <View>
        {options.map((score, index) => (
          <TouchableOpacity
            key={`${playerName}-${index}`}
            activeOpacity={0.85}
            onPress={() => handleOptionPress(score)}
            disabled={!isActivePlayer}
            style={{
              marginBottom: hp(2.0),
              minHeight: hp(8.5),
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 18,
              elevation: 6,
            }}
            className="w-full items-center justify-center rounded-[36px] border border-white/20 bg-white/[0.10]"
          >
            <Text
              style={{ fontSize: rf(3.2) }}
              className="font-main-bold tracking-wider text-white"
            >
              {score.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default React.memo(QuizOptions);