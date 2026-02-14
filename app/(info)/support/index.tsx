import React from 'react';
import { Stack } from 'expo-router'; 
import HelpScreen from '@/screens/helpScreen';

export default function RuleRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <HelpScreen/>
    </>
  );
}