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
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { initializeCoins } from "@/redux/reducers/coinsReducer";
import { AppDispatch } from "@/redux/store";
import { Onboarding } from "@/screens/onboardingScreen/onboardingScreen";

export default function Index() {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type here
  const [isLoading, setIsLoading] = useState(true);

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

  // Handle video end callback to hide splash screen
  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  // Render splash screen video if loading
  if (isLoading) {
    return <VideoPlayerComponent videoIndex={1} onVideoEnd={handleVideoEnd} />;
  }

  // Render main content after video ends
  return <Onboarding />;
}
