import React from "react";
import { Stack } from "expo-router";
import LobbySetupScreen from "@/screens/LobbySetupScreen";

/**
 * --- LOBBY ROUTE ENTRY ---
 * WHY: Expo Router requires an entry point in the 'app' directory to map paths.
 */
export default function LobbyRoute() {
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
