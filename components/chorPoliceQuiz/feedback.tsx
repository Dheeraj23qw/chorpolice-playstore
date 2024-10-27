import React, { memo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";

type FeedbackMessageProps = {
  feedbackMessage: string;
  isCorrect: boolean;
};

// Define styles once using StyleSheet.create
const styles = StyleSheet.create({
  feedbackMessageContainer: chorPoliceQuizstyles.feedbackMessageContainer,
  correctFeedback: chorPoliceQuizstyles.correctFeedback,
  wrongFeedback: chorPoliceQuizstyles.wrongFeedback,
  feedbackIcon: chorPoliceQuizstyles.feedbackIcon,
  feedbackMessage: chorPoliceQuizstyles.feedbackMessage,
});

const FeedbackMessage: React.FC<FeedbackMessageProps> = memo(
  ({ feedbackMessage, isCorrect }) => {
    // Return null if feedbackMessage is empty
    if (!feedbackMessage) return null;

    // Determine the image source based on whether the answer is correct or not
    const imageSource = isCorrect
      ? require("../../assets/gif/quiz/laugh.gif")
      : require("../../assets/gif/quiz/weep.gif");

    return (
      <View
        style={[
          styles.feedbackMessageContainer,
          isCorrect ? styles.correctFeedback : styles.wrongFeedback,
        ]}
      >
        <Image
          source={imageSource}
          style={styles.feedbackIcon}
          accessibilityLabel={isCorrect ? "Correct answer icon" : "Wrong answer icon"}
        />
        <Text style={styles.feedbackMessage} accessibilityLabel={`Feedback message: ${feedbackMessage}`}>
          {feedbackMessage}
        </Text>
      </View>
    );
  }
);

export default FeedbackMessage;
