/**
 * --- NETWORK INFRASTRUCTURE INITIALIZATION ---
 */
import "react-native-get-random-values";
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import { useNavigation } from "expo-router";

import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import VideoPlayerComponent from "@/components/IntroVideo";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";
import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import { useWelcomeBonus } from "@/service/useWelcomeBonus";
import { runAfterUI } from "@/utils/runAfterUI";
import UIViewer from "@/screens/UISandboxScreen";

export default function Index() {
  const navigation = useNavigation();
  const [stage, setStage] = useState<"video" | "game">("video");
  const [isBonusTriggered, setIsBonusTriggered] = useState(false);

  const { showModal, claimBonus } = useWelcomeBonus();
  const hasNavigated = useRef(false);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- OPTIMIZED TRANSITION ---------------- */
  const goToGame = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    runAfterUI(() => {
      console.log("🎬 [Startup] Transitioning: stage -> game");
      setStage("game");

      loadSounds();
      AudioEngine.play("quiz", "background");
    });
  };

  /* ---------------- TIMERS ---------------- */

  // 1. Fallback: Ensures game starts even if video player fails
  useEffect(() => {
    if (stage === "video") {
      const fallback = setTimeout(goToGame, 4000);
      return () => clearTimeout(fallback);
    }
  }, [stage]);

  // 2. Bonus Trigger: Clean mount-check pattern
  useEffect(() => {
    let mounted = true;
    if (stage === "game") {
      const bonusTimer = setTimeout(() => {
        if (mounted) setIsBonusTriggered(true);
      }, 7000);
      return () => {
        mounted = false;
        clearTimeout(bonusTimer);
      };
    }
  }, [stage]);

  /* ---------------- UI STAGES ---------------- */
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
