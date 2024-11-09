import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";

interface QuestionBoxProps {
  playerName: string;
}

const styles = StyleSheet.create({
  questionBox: chorPoliceQuizstyles.questionBox,
  question: chorPoliceQuizstyles.question,
  playerName: chorPoliceQuizstyles.playerName,
});

const QuestionBox: React.FC<QuestionBoxProps> = memo(({ playerName }) => (
  <View style={styles.questionBox}>
    <Text style={styles.question}>
      <Text style={styles.playerName}>{playerName}</Text>
      {", Guess your Score?"}
    </Text>
  </View>
));

QuestionBox.displayName = "QuestionBox";

export default QuestionBox;
