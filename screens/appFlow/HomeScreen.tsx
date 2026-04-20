import React, { useEffect } from "react";

import { AudioEngine } from "@/audio/audioEngine";
import { useAppSelector } from "@/hooks/useAppRedux";
import { useAwardUnlocking } from "@/hooks/useAwardUnlocking";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";

export default function HomeScreen() {
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);

  useAwardUnlocking();

  useEffect(() => {
    if (isSoundLoaded && !AudioEngine.isMuted()) {
      AudioEngine.ensureQuizGlobal?.();
    }
  }, [isSoundLoaded]);

  return <GameModeScreen />;
}
