import React from 'react';
import { Stack } from 'expo-router';
import ChorPoliceQuiz from '@/screens/chorPoliceQuizScreen/Rajamantriquizscreen';

export default function ChorPoliceQuizRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ChorPoliceQuiz/>
    </>
  );
}