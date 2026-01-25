import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { rf, hp } from "@/utils/responsive";

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
    <View className="w-full px-4">
      {/* 1. Original Question Header */}
      <View className="mb-10 items-center">
        <Text style={{ fontSize: rf(2.0) }} className="text-white text-center font-bold">
          <Text className="text-indigo-400 font-black italic">{playerName}</Text>, Guess your Score?
        </Text>
      </View>

      {/* 2. Glossy Vertical Options */}
      <View>
        {options.map((score, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => handleOptionPress(score)}
            disabled={optionsDisabled}
            // Vertical Spacing: hp(2.5) provides the "space" you requested
            style={{ 
              marginBottom: hp(2.5), 
              minHeight: hp(8.5),
              shadowColor: optionsDisabled ? "transparent" : "#6366f1",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: optionsDisabled ? 0 : 5
            }}
            className={`
              w-full rounded-[32px] items-center justify-center border-2
              ${optionsDisabled 
                ? 'bg-white/[0.02] border-white/5 opacity-40' 
                : 'bg-white/[0.08] border-white/15'}
            `}
          >
            {/* Specular Highlight (The Glass Shine) */}
            {!optionsDisabled && (
              <View className="absolute top-0 left-8 right-8 h-[1.5px] bg-white/20 rounded-full" />
            )}

            <Text 
              style={{ fontSize: rf(3.2) }} 
              className={`font-black italic ${optionsDisabled ? 'text-white/20' : 'text-white'}`}
            >
              {score}
            </Text>

            {/* Subtle Bottom Bevel */}
            <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuizOptions;