import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import VideoPlayerComponent from "@/components/IntroVideo";
import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import RoundStartLoader from "@/components/RoundStartLoader";
import { View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";
import { initializeWallet } from "@/features/wallet/walletThunks";

// ✅ NEW

export default function Index() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [stage, setStage] = useState<"splash" | "video" | "game">("splash");
  const [showWelcome, setShowWelcome] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const initApp = async () => {
      await dispatch(initializeWallet());

      dispatch(loadSounds());
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
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setStage("video");
    };

    runSplashFlow();
  }, []);

  /* ---------------- VIDEO END ---------------- */
  const handleIntroEnd = async () => {
    setStage("game");
    AudioEngine.play("quiz", "background");

    // Show welcome popup only first time
    const firstLaunch = await SecureStore.getItemAsync(
      "welcome_popup_shown"
    );

    if (!firstLaunch) {
      setShowWelcome(true);
      await SecureStore.setItemAsync(
        "welcome_popup_shown",
        "true"
      );
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
      <VideoPlayerComponent
        videoIndex={1}
        onVideoEnd={handleIntroEnd}
      />
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
