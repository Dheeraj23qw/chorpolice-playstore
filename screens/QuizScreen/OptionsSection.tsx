import React from "react";
import { View, Text, Pressable, ImageBackground } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface OptionsSectionProps {
  options: string[] | null;
  handleAnswerSelection: (answer: string) => void;
}

const OptionsSection: React.FC<OptionsSectionProps> = ({ options, handleAnswerSelection }) => {
  return (
    <View style={styles.optionsSection}>
      {options?.map((option, index) => (
        <Pressable
          key={index}
          onPress={() => handleAnswerSelection(option)}
          style={styles.optionWrapper}
          accessible
          accessibilityLabel={`Option ${index + 1}: ${option}`}
        >
          <ImageBackground
            source={require("../../assets/images/bg/quiz3.png")}
            style={styles.optionBackground}
            imageStyle={styles.optionBackgroundImage}
          >
            <Text style={styles.optionText}>{option}</Text>
          </ImageBackground>
        </Pressable>
      ))}
    </View>
  );
};

export default OptionsSection;