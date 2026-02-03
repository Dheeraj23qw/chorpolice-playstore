import React, { useEffect, useState, memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { rf, hp } from "@/utils/responsive";
import { Text } from "../Text";

type QuizOptionsProps = {
  playerName: string;
  options: number[];
  onOptionPress: (score: number) => void;
  isOptionDisabled: boolean;
};

const QuizOptions: React.FC<QuizOptionsProps> = ({
  playerName,
  options,
  onOptionPress,
  isOptionDisabled,
}) => {
  const [isOptionsDisabledForSeconds, setIsOptionsDisabledForSeconds] =
    useState(true);

  const optionsDisabled = isOptionDisabled || isOptionsDisabledForSeconds;

  useEffect(() => {
    setIsOptionsDisabledForSeconds(true);
    const timer = setTimeout(() => {
      setIsOptionsDisabledForSeconds(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [playerName]);

  const handleOptionPress = (score: number) => {
    if (!optionsDisabled) {
      onOptionPress(score);
    }
  };

  return (
    <View className="w-full px-5">
      {/* 🎯 Header */}
      <View className="mb-8 items-center">
        <Text
          style={{ fontSize: rf(2.1) }}
          className="text-white/90 text-center font-main-bold tracking-wide"
        >
          <Text className="text-indigo-400 font-main-bold ">
            {playerName}
          </Text>
          , guess your score ✨
        </Text>
      </View>

      {/* 🎮 Options */}
      <View>
        {options.map((score, index) => {
          const isDisabled = optionsDisabled;

          return (
            <TouchableOpacity
              key={`${playerName}-${index}`}
              activeOpacity={0.85}
              onPress={() => handleOptionPress(score)}
              disabled={isDisabled}
              style={{
                marginBottom: hp(2.4),
                minHeight: hp(9),
                shadowColor: isDisabled ? "transparent" : "#6366F1",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.25,
                shadowRadius: 18,
                elevation: isDisabled ? 0 : 6,
              }}
              className={`
                relative overflow-hidden
                w-full rounded-[36px] items-center justify-center
                border
                ${
                  isDisabled
                    ? "bg-white/[0.03] border-white/5 opacity-40"
                    : "bg-white/[0.10] border-white/20"
                }
              `}
            >
              {/* ✨ Top Glass Shine */}
              {!isDisabled && (
                <View className="absolute top-[6px] left-10 right-10 h-[2px] rounded-full bg-white/30" />
              )}

              {/* 🌈 Inner Glow */}
              {!isDisabled && (
                <View className="absolute inset-0 rounded-[36px] border border-indigo-400/10" />
              )}

              {/* 🔢 Score */}
              <Text
                style={{ fontSize: rf(3.4) }}
                className={`
                  font-main-bold  tracking-wider
                  ${isDisabled ? "text-white/25" : "text-white"}
                `}
              >
                {score}
              </Text>

              {/* 🪞 Bottom Bevel */}
              <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/15" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default memo(QuizOptions);