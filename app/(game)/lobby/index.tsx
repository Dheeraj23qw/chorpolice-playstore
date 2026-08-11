import React from "react";
import { Stack } from "expo-router";
import LobbySetupScreen from "@/screens/LobbySetupScreen";

/**
 * --- LOBBY ROUTE ENTRY ---
 * WHY: Expo Router requires an entry point in the 'app' directory to map paths.
 */
export default function LobbyRoute() {
  console.log("[LOBBY_TRACE] LobbyRoute mounted (app/(game)/lobby/index.tsx)");
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
