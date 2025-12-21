import React from 'react'
import { Stack } from 'expo-router';
import ImageSelectScreen from '@/screens/QuizScreen/quizDifficultySelect';

export default function QuizgameLevelRoute() {
   return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ImageSelectScreen/>
    </>
  );
}