import React from "react";
import { Stack } from "expo-router"; 
import StatsScreen from "@/screens/stats/stats";

export default function SettingRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <StatsScreen />
    </>
  );
}
