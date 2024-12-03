import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {
  loadSounds,
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/reducers/soundReducer";
import VideoPlayerComponent from "@/components/RajamantriGameScreen/videoPlayer";
import { initializeCoins } from "@/redux/reducers/coinsReducer";
import { AppDispatch } from "@/redux/store";
import * as SecureStore from "expo-secure-store";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen"; // Adjust path as needed
import { Onboarding } from "@/screens/onboardingScreen/onboardingScreen";

export default function Index() {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize coins state from SecureStore
    dispatch(initializeCoins());
  }, [dispatch]);

  // Load sounds on mount
  useEffect(() => {
    async function initializeSounds() {
      try {
        await dispatch(loadSounds() as any);
        dispatch(playSound("quiz"));
      } catch (error) {
        console.error("Failed to load or play sounds:", error);
      }
    }
    initializeSounds();

    return () => {
      dispatch(stopQuizSound());
      dispatch(unloadSounds());
    };
  }, [dispatch]);

  // Set navigation options to hide header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Check if this is the first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await SecureStore.setItemAsync("hasLaunched", "true");
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error("Error checking first launch:", error);
      }
    };

    checkFirstLaunch();
  }, []);

  // Handle video end callback to hide splash screen
  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  // Render splash screen video if loading
  if (isLoading) {
    return <VideoPlayerComponent videoIndex={1} onVideoEnd={handleVideoEnd} />;
  }

  // Render onboarding screen if it's the first launch, otherwise render the home screen
  if (isFirstLaunch) {
    return <Onboarding />;
  }

  // Render the main content (e.g., GameModeScreen or whatever your main screen is)
  return <GameModeScreen />;
}
