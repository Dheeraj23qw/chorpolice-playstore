import React, { useRef } from "react";
import { View, Text, ImageBackground, Pressable, Animated } from "react-native";
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
  
  // Create an animated value for each button
  const buttonAnimation = useRef(BUTTONS.map(() => new Animated.Value(1))).current;

  // Function to handle the sound dispatch and prevent repeated code
  const handleButtonPress = (buttonText: string, index: number) => {
    dispatch(playSound("select"));

    // Animate the button press
    Animated.sequence([
      Animated.timing(buttonAnimation[index], {
        toValue: 1.5, // Scale down
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation[index], {
        toValue: 1, // Scale back to original
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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
      {BUTTONS.map(({ id, text }, index) => {
        // Conditional rendering based on button visibility logic
        if ((text === "50-50" && showHint) || (text === "Next" && !showHint)) {
          return null; // Hide specific buttons based on state
        }

        return (
          <Animated.View
            key={id}
            style={{
              transform: [{ scale: buttonAnimation[index] }], // Apply scale animation
            }}
          >
            <Pressable
              onPress={() => handleButtonPress(text, index)}
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
          </Animated.View>
        );
      })}
    </View>
  );
};
