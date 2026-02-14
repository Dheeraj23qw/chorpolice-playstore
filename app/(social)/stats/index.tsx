import React from "react";
import { Stack } from "expo-router"; // Use Stack from expo-router
import { SettingScreen } from "@/screens/RoundSelector";
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
