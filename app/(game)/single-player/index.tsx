import React from "react";
import { Stack } from "expo-router";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { singlePlayerModes } from "@/constants/gamemode";

export default function SinglePlayerRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <GameModeSelectScreen
        title="Single Player"
        subtitle="Play with 3 Smart Bots"
        modes={singlePlayerModes}
      />
    </>
  );
}
