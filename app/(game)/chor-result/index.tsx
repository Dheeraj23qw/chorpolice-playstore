import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ChorPoliceResult from "@/screens/ResultScreen/chorPoliceResult";
import { AudioEngine } from "@/audio/audioEngine";

export default function ChorPoliceQuizRoute() {
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
      <ChorPoliceResult />
    </>
  );
}
