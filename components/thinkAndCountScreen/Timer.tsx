import React, { useEffect, useRef } from "react";
import { View, Text, ImageBackground, Animated } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface TimerProps {
  countdown: number;
}

const Timer: React.FC<TimerProps> = ({ countdown }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade in to opacity: 1
      duration: 500, // Duration of fade-in
      useNativeDriver: true,
    }).start(() => {
      // Start the fade-out animation after fade-in completes
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out to opacity: 0
        duration: 500, // Duration of fade-out
        useNativeDriver: true,
      }).start();
    });
  }, [countdown]); // Re-run the effect whenever the countdown changes

  return (
    <View style={styles.playersSection}>
      <ImageBackground
        source={require("../../assets/images/bg/timer.png")}
        style={styles.vsCircle}
        imageStyle={styles.vsCircleImage}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.vsText}>{countdown}</Text>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

export default Timer;
