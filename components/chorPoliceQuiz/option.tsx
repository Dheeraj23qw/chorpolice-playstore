import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { chorPoliceQuizstyles } from '@/screens/chorPoliceQuizScreen/quizStyle';

type QuizOptionsProps = {
  playerName: string;
  options: number[];
  onOptionPress: (score: number) => void;
  isOptionDisabled: boolean; // Add this prop to control the disabled state
};

const QuizOptions: React.FC<QuizOptionsProps> = ({ playerName, options, onOptionPress, isOptionDisabled }) => (
  <>
    <View style={chorPoliceQuizstyles.questionBox}>
      <Text style={chorPoliceQuizstyles.question}>
        <Text style={chorPoliceQuizstyles.playerName}>{playerName}</Text>, Can you Guess your Score?
      </Text>
    </View>
    {options.map((score, index) => (
      <TouchableOpacity
        key={index}
        style={chorPoliceQuizstyles.option}
        onPress={() => !isOptionDisabled && onOptionPress(score)} // Disable onPress if isOptionDisabled is true
        disabled={isOptionDisabled} // Disable the button when isOptionDisabled is true
      >
        <Text style={chorPoliceQuizstyles.optionText}>{score}</Text>
      </TouchableOpacity>
    ))}
  </>
);

export default QuizOptions;
