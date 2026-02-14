import React from 'react';
import { Stack } from 'expo-router'; 
import RulesScreen from '@/screens/RuleScreen/ruleScreen';

export default function RuleRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <RulesScreen />
    </>
  );
}