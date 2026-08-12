import React from "react";
import { Stack } from "expo-router";

import LobbySetupScreen from "@/screens/LobbySetupScreen";

export default function HostRoute() {
  console.log("[LOBBY_TRACE] HostRoute mounted (app/host/index.tsx)");
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <LobbySetupScreen forcedMode="host" requireLanReady={true} />
    </>
  );
}
