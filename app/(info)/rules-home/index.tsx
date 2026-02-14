import React from 'react';
import { Stack } from 'expo-router'; // Import Stack from expo-router
import RulesHome from '@/screens/RuleScreen/ruleHomeScreen';

export default function RuleRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <RulesHome />
    </>
  );
}