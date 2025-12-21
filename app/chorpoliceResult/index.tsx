import React from 'react';
import { Stack} from 'expo-router';
import ChorPoliceResult from '@/screens/ResultScreen/chorPoliceResult';

export default function ChorPoliceQuizRoute() {
return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ChorPoliceResult/>
    </>
  );
}