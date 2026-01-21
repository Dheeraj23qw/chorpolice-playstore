import React from 'react';

import PlayerNameScreen from '@/screens/playerNameScreen/playerName';
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