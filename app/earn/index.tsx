import React from 'react';
import { Stack } from 'expo-router';
import EarnScreen from '@/screens/earn/earnScreen';

export default function FriendRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <EarnScreen/>
      
    </>
  );
}