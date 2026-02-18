import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { View } from "react-native";

import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import RoundStartLoader from "@/components/RoundStartLoader";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";

import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import { useWelcomeBonus } from "@/service/useWelcomeBonus";

export default function Index() {
  const navigation = useNavigation();
  const [stage, setStage] = useState<"splash" | "game">("splash");

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
    const timer = setTimeout(() => {
      setStage("game");
      AudioEngine.play("quiz", "background");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  /* ---------------- UI ---------------- */
  if (stage === "splash") {
    return (
      <View style={{ flex: 1, backgroundColor: "#050508" }}>
        <RoundStartLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <GameModeScreen />
      <WelcomeBonusModal isVisible={showModal} onClaim={claimBonus} />
    </View>
  );
}
