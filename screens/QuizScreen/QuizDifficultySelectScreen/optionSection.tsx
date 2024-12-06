// src/components/OptionsSection.tsx

import React from "react";
import { View } from "react-native";
import { DifficultyOption } from "@/constants/DifficultyConstant"; // Ensure this path is correct
import Option from "./option"; // Adjust the path if necessary
import { styles } from "@/screens/QuizScreen/_styles/quizDifficultyStyles"; // Ensure this path is correct

interface OptionsSectionProps {
  options: DifficultyOption[];
  selectedOption: DifficultyOption | null;
  onSelect: (option: DifficultyOption) => void;
}

export const OptionsSection: React.FC<OptionsSectionProps> = ({
  options,
  selectedOption,
  onSelect,
}) => (
  <View style={styles.optionsSection}>
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
