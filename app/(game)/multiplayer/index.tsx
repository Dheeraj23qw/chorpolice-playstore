import React from "react";
import { Stack } from "expo-router";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { multiplayerModes } from "@/constants/gamemode";

export default function MultiplayerRoute() {
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
        subtitle="Play with Friends Locally"
        modes={multiplayerModes}
      />
    </>
  );
}
