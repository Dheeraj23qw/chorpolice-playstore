import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { chorPoliceQuizstyles } from '@/screens/chorPoliceQuizScreen/quizStyle';

type QuizOptionsProps = {
  playerName: string;
  options: number[];
  onOptionPress: (score: number) => void;
  isOptionDisabled: boolean;
  currentPlayerIsBot: boolean;
};

const QuizOptions: React.FC<QuizOptionsProps> = ({
  playerName,
  options,
  onOptionPress,
  isOptionDisabled,
  currentPlayerIsBot
}) => {
  const optionsDisabled = isOptionDisabled || currentPlayerIsBot;

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in for text
  const [pulseAnim] = useState(new Animated.Value(1)); // Pulsating effect for the player name text
  const [optionAnim] = useState(new Animated.Value(0)); // Scale animation for options

  useEffect(() => {
    // Fade-in effect for player name and question text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulsating effect for player name
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,  // Slightly scale up
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,    // Return to normal size
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    // Scale effect for options (when the component mounts)
    Animated.timing(optionAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Cleanup the pulse animation when the component unmounts
    return () => pulse.stop();
  }, []);

  const handleOptionPress = (score: number) => {
    if (!optionsDisabled) {
      // Bounce effect on option press
      Animated.sequence([
        Animated.spring(optionAnim, {
          toValue: 1.3,  // Scale up
          friction: 3,   // Create a bounce effect
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(optionAnim, {
          toValue: 1,    // Return to normal size
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Call the onPress handler
      onOptionPress(score);
    }
  };

  return (
    <>
      <View style={chorPoliceQuizstyles.questionBox}>
        <Animated.Text
          style={[
            chorPoliceQuizstyles.question,
            { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={chorPoliceQuizstyles.playerName}>{playerName}</Text>, Guess your Score?
        </Animated.Text>
      </View>

      {options.map((score, index) => (
        <TouchableOpacity
          key={index}
          style={chorPoliceQuizstyles.option}
          onPress={() => handleOptionPress(score)} 
          disabled={optionsDisabled}
        >
          <Animated.Text
            style={[
              chorPoliceQuizstyles.optionText,
              {
                transform: [{ scale: optionAnim }]  // Apply the scaling animation to each option text
              }
            ]}
          >
            {score}
          </Animated.Text>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default QuizOptions;
