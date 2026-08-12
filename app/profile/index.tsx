import React from 'react';

import { Stack } from 'expo-router';
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