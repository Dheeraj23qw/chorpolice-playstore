import React, { useEffect } from "react";
import {  router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ChorPoliceQuiz from "@/screens/chorPoliceQuizScreen/Rajamantriquizscreen";
import { AudioEngine } from "@/audio/audioEngine";

export default function ChorPoliceQuizRoute() {
  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset
  );

  useEffect(() => {
    if (isGameReset) {
      AudioEngine.stopAllExceptQuiz();
    }
  }, [isGameReset]);

  if (isGameReset) return null;

  return (
    <>
      <ChorPoliceQuiz />
    </>
  );
}
