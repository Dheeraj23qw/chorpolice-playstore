/**
 * --- NETWORK INFRASTRUCTURE INITIALIZATION ---
 * These polyfills bridge the gap between Node.js-based networking
 * libraries (TCP/UDP) and the React Native runtime environment.
 */

// Required for secure random ID generation (nanoid/uuid)
import "react-native-get-random-values";

// Import Buffer to allow handling of binary network packets
import { Buffer } from "buffer";

// Attach Buffer to the global scope so networking packages
// can access it globally without needing manual imports.
globalThis.Buffer = Buffer;

/** * --- END OF NETWORK INITIALIZATION ---
 */

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
  // Sound loading is deferred to goToGame() — NOT here.
  // WHY: loadSounds() does heavy I/O (decoding audio) which competes
  // with the video decoder for CPU, causing stutters on low-end devices.

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- SAFE TRANSITION ---------------- */
  const goToGame = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    console.log("🎬 [Startup] Transitioning: stage -> game");
    setStage("game");

    // Load sounds AFTER the video — non-blocking
    setTimeout(() => {
      loadSounds();
      AudioEngine.play("quiz", "background");
    }, 100);
  };

  /* ---------------- FALLBACK ---------------- */
  useEffect(() => {
    if (stage === "video") {
      console.log("📼 [Startup] Now in Video Stage. Fallback timer active.");
      const fallback = setTimeout(() => {
        console.warn("⚠️ [Startup] Video timed out or failed. Falling back to game menu.");
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
