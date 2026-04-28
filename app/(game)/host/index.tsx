import React from "react";
import { Stack } from "expo-router";

import LobbySetupScreen from "@/screens/LobbySetupScreen";

export default function HostRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <LobbySetupScreen forcedMode="host" requireLanReady={false} />
    </>
  );
}
