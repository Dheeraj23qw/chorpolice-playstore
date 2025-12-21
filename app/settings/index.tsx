import React from "react";
import { Stack } from "expo-router"; // Use Stack from expo-router
import { SettingScreen } from "@/screens/setting";

export default function SettingRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <SettingScreen />
    </>
  );
}