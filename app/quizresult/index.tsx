import React from 'react';
import { Stack} from 'expo-router';

import QuizResult from '@/screens/QuizScreen/quizResult';

export default function QuizResultRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <QuizResult/>
    </>
  );
 
}