import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { initializeCoins } from "@/redux/reducers/coinsReducer";
import * as SecureStore from "expo-secure-store";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import VideoPlayerComponent from "@/components/IntroVideo";
import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";

export default function Index() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  /* ---------------- INIT COINS ---------------- */
  useEffect(() => {
    dispatch(initializeCoins());
  }, [dispatch]);

  /* ---------------- LOAD AUDIO ONCE ---------------- */
  useEffect(() => {
    dispatch(loadSounds());
  }, [dispatch]);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- FIRST LAUNCH CHECK ---------------- */
  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await SecureStore.getItemAsync("hasLaunched");

      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await SecureStore.setItemAsync("hasLaunched", "true");
      } else {
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  /* ---------------- INTRO END HANDLER ---------------- */
  const handleIntroEnd = () => {
    setIsLoading(false);

      AudioEngine.play("quiz", "background");
  };

  /* ---------------- UI ---------------- */
  if (isLoading) {
    return (
      <VideoPlayerComponent
        videoIndex={1}
        onVideoEnd={handleIntroEnd}
      />
    );
  }

  return <GameModeScreen />;
}
