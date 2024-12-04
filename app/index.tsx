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
      await dispatch(loadSounds() as any);
      dispatch(playSound("quiz"));
    }
    initializeSounds();
  
    // Clean up only if the component is truly unmounted (not navigating)
    return () => {
      if (navigation.isFocused()) {
        dispatch(stopQuizSound());
        dispatch(unloadSounds());
      }
    };
  }, [dispatch, navigation]);
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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

  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <VideoPlayerComponent videoIndex={1} onVideoEnd={handleVideoEnd} />;
  }

  if (isFirstLaunch) {
    return <Onboarding />;
  }

  return <GameModeScreen />;
}
