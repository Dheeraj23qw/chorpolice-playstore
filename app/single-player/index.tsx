import React from "react";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { singlePlayerModes } from "@/constants/gamemode";

export default function SinglePlayerRoute() {
  return (
    <GameModeSelectScreen
      title="Single Player"
      subtitle="Play with 3 Smart Bots"
      modes={singlePlayerModes}
      drawerContext="single_player"
    />
  );
}
