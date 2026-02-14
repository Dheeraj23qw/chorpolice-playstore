import React from "react";
import { Stack } from "expo-router";
import BugsScreen from "@/screens/BugScreen/bug";
export default function BugRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <BugsScreen />
    </>
  );
}
