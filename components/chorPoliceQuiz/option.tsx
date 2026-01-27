import React, { useEffect, useState, memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { rf, hp, wp } from "@/utils/responsive";

type QuizOptionsProps = {
  playerName: string;
  options: number[];
  onOptionPress: (score: number) => void;
  isOptionDisabled: boolean;
  currentPlayerIsBot: boolean;
};

const QuizOptions: React.FC<QuizOptionsProps> = ({
  playerName,
  options,
  onOptionPress,
  isOptionDisabled,
  currentPlayerIsBot,
}) => {
  const [isOptionsDisabledForSeconds, setIsOptionsDisabledForSeconds] =
    useState(true);

  const optionsDisabled =
    isOptionDisabled || currentPlayerIsBot || isOptionsDisabledForSeconds;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOptionsDisabledForSeconds(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

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
          className="text-white/90 text-center font-extrabold tracking-wide"
        >
          <Text className="text-indigo-400 font-black italic">
            {playerName}
          </Text>
          , guess your score ✨
        </Text>
      </View>

      {/* 🎮 Options */}
      <View>
        {options.map((score, index) => {
          const disabledStyle = optionsDisabled;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => handleOptionPress(score)}
              disabled={disabledStyle}
              style={{
                marginBottom: hp(2.4),
                minHeight: hp(9),
                shadowColor: disabledStyle ? "transparent" : "#6366F1",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.25,
                shadowRadius: 18,
                elevation: disabledStyle ? 0 : 6,
              }}
              className={`
                relative overflow-hidden
                w-full rounded-[36px] items-center justify-center
                border
                ${
                  disabledStyle
                    ? "bg-white/[0.03] border-white/5 opacity-40"
                    : "bg-white/[0.10] border-white/20"
                }
              `}
            >
              {/* ✨ Top Glass Shine */}
              {!disabledStyle && (
                <View className="absolute top-[6px] left-10 right-10 h-[2px] rounded-full bg-white/30" />
              )}

              {/* 🌈 Inner Glow */}
              {!disabledStyle && (
                <View className="absolute inset-0 rounded-[36px] border border-indigo-400/10" />
              )}

              {/* 🔢 Score */}
              <Text
                style={{ fontSize: rf(3.4) }}
                className={`
                  font-black italic tracking-wider
                  ${
                    disabledStyle
                      ? "text-white/25"
                      : "text-white drop-shadow-lg"
                  }
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
