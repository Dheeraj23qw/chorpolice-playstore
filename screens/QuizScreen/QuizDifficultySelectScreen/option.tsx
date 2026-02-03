// src/components/Option.tsx

import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { DifficultyOption } from "@/constants/DifficultyConstant";
import { Text } from "@/components/Text";

interface OptionProps {
  option: DifficultyOption;
  isSelected: boolean;
  onSelect: (option: DifficultyOption) => void;
}

const Option: React.FC<OptionProps> = ({ option, isSelected, onSelect }) => {
  return (
    <Pressable
      onPress={() => onSelect(option)}
      // Native-feeling touch response
      className="active:scale-95 transition-transform"
    >
      <View
        className={`
          min-h-[56px]
          items-center
          justify-center
          rounded-2xl
          border
          px-4
          py-3
          shadow-sm
          ${
            isSelected
              ? "bg-indigo-600 border-indigo-400"
              : "bg-white/10 border-white/20"
          }
        `}
      >
        <Text
          className={`
            text-base
            font-main-bold
            tracking-wide
            uppercase
            ${
              isSelected
                ? "text-white"
                : "text-slate-200"
            }
          `}
        >
          {option}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(Option);