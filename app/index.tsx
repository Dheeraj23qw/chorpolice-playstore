import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { router, useNavigation } from "expo-router";
import { View } from "react-native";

import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import VideoPlayerComponent from "@/components/IntroVideo";
import RoundStartLoader from "@/components/RoundStartLoader";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";

import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import { useWelcomeBonus } from "@/service/useWelcomeBonus";

export default function Index() {
  const navigation = useNavigation();
  const [stage, setStage] = useState<"splash" | "video" | "game">("splash");

  const { showModal, claimBonus } = useWelcomeBonus();

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadSounds();
  }, []);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- SPLASH FLOW ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => setStage("video"), 3000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- VIDEO END ---------------- */
  const handleIntroEnd = useCallback(() => {
    setStage("game");
    AudioEngine.play("quiz", "background");
  }, []);

  /* ---------------- UI ---------------- */
  if (stage === "splash") {
    return <View style={{ flex: 1, backgroundColor: "#050508" }}><RoundStartLoader /></View>;
  }

  if (stage === "video") {
    return <VideoPlayerComponent videoIndex={1} onVideoEnd={handleIntroEnd} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <GameModeScreen />

      <WelcomeBonusModal isVisible={showModal} onClaim={claimBonus} />
    </View>
  );
}
