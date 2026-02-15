import React from 'react';

import { Stack } from 'expo-router';
import LeaderboardScreen from '@/screens/GlobalLeaderBoard/leaderboard';

export default function LeaderboardRoute() {
 return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <LeaderboardScreen/>
    </>
  );
}