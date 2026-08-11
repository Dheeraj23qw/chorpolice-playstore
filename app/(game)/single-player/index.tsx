import React from "react";
import { Stack } from "expo-router";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { singlePlayerModes } from "@/constants/gamemode";

export default function SinglePlayerRoute() {
  console.log("[NAV_DEBUG] [SINGLE PLAYER] mounted route");
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
        subtitle="Take on 3 Smart Bots"
        modes={singlePlayerModes}
        drawerContext="single_player"
      />
    </>
  );
}
