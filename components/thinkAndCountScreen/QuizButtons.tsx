import React from "react";
import { View, Text, ImageBackground, Pressable } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";
import { useDispatch } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";

// Constants for button texts to avoid repetition and improve maintainability
const BUTTONS = [
  { id: 1, text: "50-50" },
  { id: 2, text: "Quit" },
  { id: 3, text: "Quiz Table" },
  { id: 4, text: "Next" },
];

interface ButtonProps {
  showHint: boolean;
  setIsTableOpen: (isOpen: boolean) => void;
  handleNextQuestion: () => void;
  handleFiftyFifty: () => void;
  handleQuit: () => void;
}

export const QuizButton: React.FC<ButtonProps> = ({
  showHint,
  setIsTableOpen,
  handleNextQuestion,
  handleFiftyFifty,
  handleQuit,
}) => {
  const dispatch = useDispatch();

  // Function to handle the sound dispatch and prevent repeated code
  const handleButtonPress = (buttonText: string) => {
    dispatch(playSound("select"));
    switch (buttonText) {
      case "Quiz Table":
        setIsTableOpen(true);
        break;
      case "Next":
        handleNextQuestion();
        break;
      case "Quit":
        handleQuit();
        break;
      case "50-50":
        handleFiftyFifty();
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.buttonsSection}>
      {BUTTONS.map(({ id, text }) => {
        // Conditional rendering based on button visibility logic
        if ((text === "50-50" && showHint) || (text === "Next" && !showHint)) {
          return null; // Hide specific buttons based on state
        }

        return (
          <Pressable
            key={id}
            onPress={() => handleButtonPress(text)}
            style={({ pressed }) => [
              styles.iconBackground // Visual feedback on press
            ]}
            accessible
            accessibilityLabel={text}
            accessibilityRole="button" // Adding accessibility role for screen readers
          >
            <ImageBackground
              source={require("../../assets/images/bg/quiz3.png")}
              style={styles.iconBackground}
              imageStyle={styles.iconBackgroundImage}
            >
              <Text style={styles.iconText}>{text}</Text>
            </ImageBackground>
          </Pressable>
        );
      })}
    </View>
  );
};
