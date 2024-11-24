import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface TimerProps {
  countdown: number;
}

const Timer: React.FC<TimerProps> = ({ countdown }) => {
  return (
    <View style={styles.playersSection}>
      <ImageBackground
        source={require("../../assets/images/bg/timer.png")}
        style={styles.vsCircle}
        imageStyle={styles.vsCircleImage}
      >
        <Text style={styles.vsText}>{countdown}</Text>
      </ImageBackground>
    </View>
  );
};

export default Timer;