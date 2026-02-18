import React from 'react';
import { Stack } from 'expo-router';
import FriendsScreen from '@/screens/FriendScreen.tsx/friend';

export default function FriendRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <FriendsScreen/>
    </>
  );
}