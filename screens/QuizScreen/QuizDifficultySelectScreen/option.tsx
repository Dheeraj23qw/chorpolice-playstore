// src/components/Option.tsx

import React from "react";
import { Pressable, Text, ImageBackground } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizDifficultyStyles"; // Ensure this path is correct
import { DifficultyOption } from "@/constants/DifficultyConstant";
interface OptionProps {
  option: DifficultyOption;
  isSelected: boolean;
  onSelect: (option: DifficultyOption) => void;
}

const Option: React.FC<OptionProps> = ({ option, isSelected, onSelect }) => (
  <Pressable
    onPress={() => onSelect(option)}
    style={({ pressed }) => [
      styles.optionPressable,
      pressed && styles.optionPressed,
    ]}
  >
    <ImageBackground
      source={require("../../assets/images/bg/quiz3.png")} // Adjust the image path as needed
      style={styles.optionBackground}
      imageStyle={styles.optionBackgroundImage}
    >
      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
        {option}
      </Text>
    </ImageBackground>
  </Pressable>
);

export default Option;
