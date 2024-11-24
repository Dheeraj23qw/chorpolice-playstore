import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For arrow icon if needed
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface ButtonProps {
showHint: boolean;
setIsTableOpen: (isOpen: boolean) => void;
handleNextQuestion: () => void;
}

const buttons = [
  { id: 1, text: "50-50" },
  { id: 2, text: "Quit" },
  { id: 3, text: "Quiz Table" },
  { id: 4, text: "Next" },
];

export const QuizButton: React.FC<ButtonProps> = ({showHint,setIsTableOpen,handleNextQuestion}) => {
  return (
    <View style={styles.buttonsSection}>
      {buttons.map((button) => {
        if (button.text === "50-50" && showHint) {
          return null; // Hide 50-50 button if hint is available
        }
  
        if (button.text === "Next" && !showHint) {
          return null; // Hide the "Next" button if hint is not available
        }
  
        return (
          <ImageBackground
            key={button.id}
            source={require("../../assets/images/bg/quiz3.png")}
            style={styles.iconBackground}
            imageStyle={styles.iconBackgroundImage}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (button.text === "Quiz Table") {
                  setIsTableOpen(true);
                }else if (button.text === "Next") {
                  handleNextQuestion(); // Handle next question click
                }
              }}
              accessible
              accessibilityLabel={button.text}
            >
              <Text style={styles.iconText}>{button.text}</Text>
  
             
            </TouchableOpacity>
          </ImageBackground>
        );
      })}
    </View>
  );
};
