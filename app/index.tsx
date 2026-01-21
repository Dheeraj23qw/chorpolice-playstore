import "../global.css";

import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
// 1. Ensure you are using the correct library for Safe Areas
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  loadSounds,
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/reducers/soundReducer";
import VideoPlayerComponent from "@/components/RajamantriGameScreen/videoPlayer";
import { initializeCoins } from "@/redux/reducers/coinsReducer";
import * as SecureStore from "expo-secure-store";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { Onboarding } from "@/screens/onboardingScreen/onboardingScreen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import MaintenanceScreen from "./+not-found";
import ProfileScreen from "@/screens/profileScreen/profile";
export default function Index() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeCoins());
  }, [dispatch]);

  // Handle Sound Lifecycle
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      // With expo-audio, loading is faster
      await dispatch(loadSounds());
      if (isMounted) {
        dispatch(playSound("quiz"));
      }
    }

    initialize();

    return () => {
      isMounted = false;
      dispatch(stopQuizSound());
      dispatch(unloadSounds());
    };
  }, [dispatch]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
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
      } catch (e) {
        setIsFirstLaunch(false); // Fallback
      }
    };
    checkFirstLaunch();
  }, []);

  // Show Video Splash Screen
  // if (isLoading) {
  //   return (
  //     <VideoPlayerComponent
  //       videoIndex={1}
  //       onVideoEnd={() => setIsLoading(false)}
  //     />
  //   );
  // }

  return <>{isFirstLaunch ? <Onboarding /> : <GameModeScreen />}</>;
}
