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
  const [stage, setStage] = useState<"video" | "game">("video");
  const [isBonusTriggered, setIsBonusTriggered] = useState(false);

  const { showModal, claimBonus } = useWelcomeBonus();
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
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    setStage("game");
    AudioEngine.play("quiz", "background");
  };

  /* ---------------- FALLBACK ---------------- */
  useEffect(() => {
    if (stage === "video") {
      const fallback = setTimeout(() => {
        goToGame();
      }, 4000);
      return () => clearTimeout(fallback);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "game") {
      const bonusTimer = setTimeout(() => {
        setIsBonusTriggered(true);
      }, 12000); // 12 Seconds

      return () => clearTimeout(bonusTimer);
    }
  }, [stage]);

  /* ---------------- UI ---------------- */

  if (stage === "video") {
    return (
      <View style={{ flex: 1, backgroundColor: "#050508" }}>
        <VideoPlayerComponent videoIndex={1} onVideoEnd={goToGame} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <GameModeScreen />

      <WelcomeBonusModal
        isVisible={showModal && isBonusTriggered}
        onClaim={claimBonus}
      />
    </View>
  );
}
