import React from 'react';
import { Stack } from 'expo-router';
import AwardSection from '@/screens/AwardSceen/award';

export default function AwardRoute() {
return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <AwardSection/>
    </>
  );
}