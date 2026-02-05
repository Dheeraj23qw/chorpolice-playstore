import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { initializeCoins } from "@/redux/reducers/coinsReducer";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import VideoPlayerComponent from "@/components/IntroVideo";
import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import RoundStartLoader from "@/components/RoundStartLoader";
import { View } from "react-native";

export default function Index() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [stage, setStage] = useState<
    "splash" | "video" | "game"
  >("splash");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    dispatch(initializeCoins());
    dispatch(loadSounds());
  }, [dispatch]);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- SPLASH FLOW ---------------- */
  useEffect(() => {
    const runSplashFlow = async () => {
      // 1️⃣ Show loader for 3 sec
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2️⃣ Then show video
      setStage("video");
    };

    runSplashFlow();
  }, []);

  /* ---------------- VIDEO END ---------------- */
  const handleIntroEnd = () => {
    // 3️⃣ After video finishes
    setStage("game");

    // 4️⃣ Start background music
    AudioEngine.play("quiz", "background");
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

  return <GameModeScreen />;
}
