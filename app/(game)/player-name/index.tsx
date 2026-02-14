import React from 'react';

import PlayerNameScreen from '@/screens/playerNameScreen/playerName';
import { Stack } from 'expo-router';

export default function PlayerNameRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <PlayerNameScreen/>
    </>
  );
}