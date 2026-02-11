import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { router, useNavigation } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { View } from "react-native";

import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import VideoPlayerComponent from "@/components/IntroVideo";
import RoundStartLoader from "@/components/RoundStartLoader";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";

import { AudioEngine } from "@/audio/audioEngine";
import { loadSounds } from "@/redux/reducers/soundReducer";
import { applyTransaction } from "@/features/wallet/walletSlice";
import { welcomeService } from "@/service/welcomeService";

export default function Index() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [stage, setStage] = useState<"splash" | "video" | "game">("splash");
  const [showWelcome, setShowWelcome] = useState(false);
  const [claiming, setClaiming] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    dispatch(loadSounds());
  }, [dispatch]);

  /* ---------------- HIDE HEADER ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /* ---------------- SPLASH FLOW ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage("video");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  /* ---------------- VIDEO END ---------------- */
  const handleIntroEnd = useCallback(async () => {
    setStage("game");

    AudioEngine.play("quiz", "background");

    try {
      const alreadyClaimed = await welcomeService.hasClaimed();

      if (!alreadyClaimed) {
        setShowWelcome(true);
      }
    } catch (err) {
      console.warn("Welcome check failed:", err);
    }
  }, []);

  /* ---------------- CLAIM BONUS ---------------- */
  const handleClaim = useCallback(async () => {
    if (claiming) return;

    try {
      setClaiming(true);

      // Add coins
      dispatch(
        applyTransaction({
          amount: 1000,
          reason: "Welcome Bonus Reward",
          source: "rewards_claim",
          metadata: {
            rewardType: "welcome_bonus",
            version: "v1",
            triggeredFrom: "first_launch",
          },
        })
      );

      // Mark permanently claimed
      await welcomeService.markClaimed();

      setShowWelcome(false);

      router.push("/earn");
    } catch (err) {
      console.warn("Welcome claim failed:", err);
    } finally {
      setClaiming(false);
    }
  }, [dispatch, claiming]);

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
      />
    </View>
  );
}
