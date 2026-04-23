import React from "react";
import { Stack } from "expo-router";

import LobbySetupScreen from "@/screens/LobbySetupScreen";

export default function LobbySetupRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <LobbySetupScreen />
    </>
  );
}
