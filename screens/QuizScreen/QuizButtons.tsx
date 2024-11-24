import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";
import { useDispatch } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";

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

export const QuizButton: React.FC<ButtonProps> = ({
  showHint,
  setIsTableOpen,
  handleNextQuestion,
}) => {
  const dispatch = useDispatch();

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
          <Pressable
            key={button.id}
            onPress={() => {
              if (button.text === "Quiz Table") {
                setIsTableOpen(true);
                dispatch(playSound("select"));
              } else if (button.text === "Next") {
                handleNextQuestion();
                dispatch(playSound("select"));
              }
            }}
            style={({ pressed }) => [styles.iconBackground]}
            accessible
            accessibilityLabel={button.text}
          >
            <ImageBackground
              source={require("../../assets/images/bg/quiz3.png")}
              style={styles.iconBackground}
              imageStyle={styles.iconBackgroundImage}
            >
              <Text style={styles.iconText}>{button.text}</Text>
            </ImageBackground>
          </Pressable>
        );
      })}
    </View>
  );
};
