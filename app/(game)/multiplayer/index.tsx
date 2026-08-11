import React from "react";
import { Stack } from "expo-router";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { multiplayerModes } from "@/constants/gamemode";

export default function MultiplayerRoute() {
  console.log("[NAV_DEBUG] [MULTIPLAYER] mounted route");
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <GameModeSelectScreen
        title="Multiplayer"
        subtitle="Bring your gang to play with you"
        modes={multiplayerModes}
        drawerContext="multiplayer"
      />
    </>
  );
}
