import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  // Disable options if the current player is a bot
  const optionsDisabled = isOptionDisabled || currentPlayerIsBot;

  return (
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
          onPress={() => !optionsDisabled && onOptionPress(score)} 
          disabled={optionsDisabled}
        >
          <Text style={chorPoliceQuizstyles.optionText}>{score}</Text>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default QuizOptions;
