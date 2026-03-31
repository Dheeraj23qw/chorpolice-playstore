import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigation } from "expo-router";
import { View } from "react-native";

import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import VideoPlayerComponent from "@/components/IntroVideo";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";

import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import { useWelcomeBonus } from "@/service/useWelcomeBonus";

export default function Index() {
  const navigation = useNavigation();

  // 👇 only 2 stages now
  const [stage, setStage] = useState<"video" | "game">("video");

  const { showModal, claimBonus } = useWelcomeBonus();

  // ✅ prevent multiple triggers (robust)
  const hasNavigated = useRef(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadSounds();
  }, []);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- SAFE TRANSITION ---------------- */
  const goToGame = () => {
    if (hasNavigated.current) return; // prevent double call
    hasNavigated.current = true;

    setStage("game");
    AudioEngine.play("quiz", "background");
  };

  /* ---------------- FALLBACK (IMPORTANT) ---------------- */
  useEffect(() => {
    if (stage === "video") {
      const fallback = setTimeout(() => {
        goToGame(); // if video fails
      }, 4000); // slightly more than 2s video

      return () => clearTimeout(fallback);
    }
  }, [stage]);

  /* ---------------- UI ---------------- */

  // 🎬 VIDEO
  if (stage === "video") {
    return (
      <View style={{ flex: 1, backgroundColor: "#050508" }}>
        <VideoPlayerComponent
          videoIndex={1}
          onVideoEnd={goToGame} // 👈 direct transition
        />
      </View>
    );
  }

  // 🎮 GAME
  return (
    <View style={{ flex: 1 }}>
      <GameModeScreen />
      <WelcomeBonusModal isVisible={showModal} onClaim={claimBonus} />
    </View>
  );
}
