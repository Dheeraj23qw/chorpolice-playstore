import React from "react";
import { Stack } from "expo-router";

import LobbySetupScreen from "@/screens/LobbySetupScreen";

export default function LobbySetupRoute() {
  console.log(
    "[LOBBY_TRACE] LobbySetupRoute mounted (app/lobby-setup/index.tsx)",
  );
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
