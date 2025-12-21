import React from 'react';
import { Stack} from 'expo-router';
import GameModeScreen from '@/screens/GameModeScreen/gameModeScreen';

export default function ModeSelectRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <GameModeScreen/>
    </>
  );
}