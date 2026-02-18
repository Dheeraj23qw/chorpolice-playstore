import React, { useEffect } from "react";
import RajaMantriGameScreen from "@/screens/RajaMantriGameScreen/RajaMantriGameScreen";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AudioEngine } from "@/audio/audioEngine";

export default function ChorPoliceGameRoute() {
  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset,
  );

  useEffect(() => {
    if (isGameReset) {
      AudioEngine.stopAllExceptQuiz();
    }
  }, [isGameReset]);

  if (isGameReset) return null;
  return (
    <>
      <RajaMantriGameScreen />
    </>
  );
}
