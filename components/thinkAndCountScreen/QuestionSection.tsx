// QuestionSection.tsx
import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface QuestionSectionProps {
  question: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  return (
    <>
     <View style={styles.circularSection}>
          <ImageBackground
            source={require("../../assets/images/bg/quizbg5.png")} // Circular background
            style={styles.circularBackground}
            imageStyle={styles.circularBackgroundImage}
          />
        </View>
    <View style={styles.questionSection}>
        
      <ImageBackground
        source={require("../../assets/images/bg/quiz3.png")}
        style={styles.questionBackground}
        imageStyle={styles.questionBackgroundImage}
      >
        <Text style={styles.questionText}>{question}</Text>
      </ImageBackground>
    </View>
    </>
  );
};

export default QuestionSection;
