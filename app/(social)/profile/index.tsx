import React from 'react';

import PlayerNameScreen from '@/screens/playerNameScreen/playerName';
import { Stack } from 'expo-router';
import ProfileScreen from '@/screens/profileScreen/profile';
import UserProfile from '@/screens/profileScreen/profile';

export default function ProfileRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <UserProfile/>
    </>
  );
}