import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation, useRouter } from "expo-router"; // Added useRouter for navigation
import { initializeCoins, addCoins } from "@/redux/reducers/coinsReducer";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import VideoPlayerComponent from "@/components/IntroVideo";
import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import RoundStartLoader from "@/components/RoundStartLoader";
import { View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";


export default function Index() {
  const navigation = useNavigation();
  const router = useRouter(); 
  const dispatch = useDispatch<AppDispatch>();

  const [stage, setStage] = useState<"splash" | "video" | "game">("splash");
  const [showWelcome, setShowWelcome] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const initApp = async () => {
      // 1. Initialize coins logic
      await dispatch(initializeCoins());
      dispatch(loadSounds());

      // 2. Check for First Launch flag
      const hasLaunched = await SecureStore.getItemAsync('hasLaunchedBefore');
      if (hasLaunched === null) {
        // We don't show it yet (waiting for 'game' stage)
        // We just mark that we NEED to show it later
        await SecureStore.setItemAsync('hasLaunchedBefore', 'true');
        // We delay the true state until the game menu is visible
      }
    };
    initApp();
  }, [dispatch]);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- SPLASH FLOW ---------------- */
  useEffect(() => {
    const runSplashFlow = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStage("video");
    };
    runSplashFlow();
  }, []);

  /* ---------------- VIDEO END ---------------- */
  const handleIntroEnd = async () => {
    setStage("game");
    AudioEngine.play("quiz", "background");

    // 🚩 Check if this was the very first launch to show popup
    const firstLaunch = await SecureStore.getItemAsync('welcome_popup_shown');
    if (!firstLaunch) {
      setShowWelcome(true);
      await SecureStore.setItemAsync('welcome_popup_shown', 'true');
    }
  };

  /* ---------------- MODAL ACTIONS ---------------- */
  const handleClaim = () => {
    setShowWelcome(false);
  };

  const handleGoToSpin = () => {
    setShowWelcome(false);
  };

  /* ---------------- UI ---------------- */

  if (stage === "splash") {
    return (
      <View style={{ flex: 1, backgroundColor: "#050508" }}>
        <RoundStartLoader />
      </View>
    );
  }

  if (stage === "video") {
    return (
      <VideoPlayerComponent videoIndex={1} onVideoEnd={handleIntroEnd} />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <GameModeScreen />
      
      <WelcomeBonusModal 
        isVisible={showWelcome} 
        onClaim={handleClaim} 
        onGoToSpin={handleGoToSpin} 
      />
    </View>
  );
}