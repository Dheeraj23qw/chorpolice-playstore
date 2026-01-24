// src/components/OptionsSection.tsx

import React from "react";
import { View } from "react-native";
import { DifficultyOption } from "@/constants/DifficultyConstant";
import Option from "./option";

interface OptionsSectionProps {
  options: DifficultyOption[];
  selectedOption: DifficultyOption | null;
  onSelect: (option: DifficultyOption) => void;
}

export const OptionsSection: React.FC<OptionsSectionProps> = ({
  options,
  selectedOption,
  onSelect,
}) => {
  return (
    <View className="gap-3 px-4 mt-4">
      {options.map((option, index) => (
        <Option
          key={index}
          option={option}
          isSelected={selectedOption === option}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
};
