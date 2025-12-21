import React from 'react';
import { Stack } from 'expo-router';
import RajaMantriGameScreen from '@/screens/RajaMantriGameScreen/RajaMantriGameScreen';

export default function ChorPoliceGameRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <RajaMantriGameScreen/>
    </>
  );
}