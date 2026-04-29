import React, { useCallback, useEffect, useRef } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { runtimeConfig } from "@/constants/runtime";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { setAppPhase } from "@/redux/reducers/appFlowReducer";
import { enqueueModal } from "@/redux/reducers/modalQueueReducer";
import { loadSounds } from "@/redux/reducers/soundReducer";
import HomeScreen from "@/screens/appFlow/HomeScreen";
import OnboardingScreen from "@/screens/appFlow/OnboardingScreen";
import VideoScreen from "@/screens/appFlow/VideoScreen";
import { PremiumSplashCard } from "@/components/PremiumSplashCard";
import { assetLoader } from "@/service/assetLoader";
import { syncLocalLobbyProfile } from "@/service/lanLobbyCoordinator";
import { getOnboardingDone, setOnboardingDone } from "@/storage/appStorage";
import { canShowLowCoinModal } from "@/storage/lowCoinStorage";
import { runAfterUI } from "@/utils/runAfterUI";

export default function AppController() {
  const dispatch = useAppDispatch();
  const phase = useAppSelector((state) => state.appFlow.phase);
  const activeModal = useAppSelector((state) => state.modalQueue.activeModal);
  const coins = useAppSelector((state) => state.wallet.coins);
  const firstLaunch = useAppSelector((state) => state.wallet.firstLaunch);
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);
  const unlockedAwardsCount = useAppSelector(
    (state) => state.awards.unlocked.length,
  );
  const connectionStatus = useAppSelector(
    (state) => state.session.connectionStatus,
  );
  const loadingTaskRef = useRef<Promise<void> | null>(null);
  const bootstrappedRef = useRef(false);
  // PROD-8 FIX: only enqueue reward once per session; re-queuing on every
  // activeModal change causes an infinite loop while awards.unlocked stays > 0
  const rewardQueuedRef = useRef(false);

  const prepareIntroFlow = useCallback(() => {
    if (loadingTaskRef.current) return loadingTaskRef.current;

    const task = (async () => {
      try {
        // Perform preloading and the animation delay in parallel.
        // We ensure the splash shows for at least 2500ms for the zoom effect.
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 2500)),
          isSoundLoaded
            ? Promise.resolve()
            : dispatch(loadSounds()).unwrap().catch(() => undefined),
          assetLoader.preloadIntroAssets(),
        ]);
      } finally {
        void assetLoader.preloadBackgroundAssets();
        dispatch(setAppPhase("VIDEO"));
        loadingTaskRef.current = null;
      }
    })();

    loadingTaskRef.current = task;
    return task;
  }, [dispatch, isSoundLoaded]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    // If the phase is already HOME (e.g. returning to the root route from a meta screen),
    // do not restart the intro flow. The user has already seen it this session.
    if (phase === "HOME") return;

    runAfterUI(() => {
      const shouldShowOnboarding =
        runtimeConfig.forceOnboardingEveryLaunch || !getOnboardingDone();

      if (shouldShowOnboarding) {
        dispatch(setAppPhase("ONBOARDING"));
        return;
      }

      void prepareIntroFlow();
    });
  }, [dispatch, prepareIntroFlow, phase]);

  useEffect(() => {
    if (phase === "HOME" && firstLaunch) {
      dispatch(enqueueModal("BONUS_MODAL"));
    }
  }, [dispatch, firstLaunch, phase]);

  // LOW COIN MODAL REMOVED: Users now use referral system to earn coins manually.
  /*
  useEffect(() => {
    if (
      phase === "HOME" &&
      !firstLaunch &&
      coins < 1000 &&
      canShowLowCoinModal()
    ) {
      dispatch(enqueueModal("LOW_COIN_MODAL"));
    }
  }, [coins, dispatch, firstLaunch, phase]);
  */

  useEffect(() => {
    if (phase === "HOME" && unlockedAwardsCount > 0 && !rewardQueuedRef.current) {
      rewardQueuedRef.current = true; // PROD-8: only enqueue once
      dispatch(enqueueModal("REWARD_MODAL"));
    }
    // Reset flag when awards count drops back to 0 (claimed)
    if (unlockedAwardsCount === 0) {
      rewardQueuedRef.current = false;
    }
  }, [dispatch, phase, unlockedAwardsCount]);

  useEffect(() => {
    if (connectionStatus !== "IDLE") {
      console.log("[AppController] Syncing coins to lobby:", coins);
      syncLocalLobbyProfile({ coins });
    }
  }, [coins, connectionStatus]);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDone(true);
    void prepareIntroFlow();
  }, [prepareIntroFlow]);

  const handleVideoComplete = useCallback(() => {
    dispatch(setAppPhase("HOME"));
  }, [dispatch]);

  // UI-4: each phase gets a fast fade-in so hard-cuts are replaced with
  // smooth 200ms entrances — wrapping with a stable key forces re-mount
  // (and re-animation) only when the phase actually changes.
  const wrapPhase = (key: string, child: React.ReactNode) => (
    <Animated.View
      key={key}
      entering={FadeIn.duration(600)}
      exiting={FadeOut.duration(400)}
      style={{ flex: 1 }}
    >
      {child}
    </Animated.View>
  );

  switch (phase) {
    case "ONBOARDING":
      return wrapPhase("onboarding", <OnboardingScreen onComplete={handleOnboardingComplete} />);
    case "VIDEO":
      return wrapPhase("video", <VideoScreen onComplete={handleVideoComplete} />);
    case "HOME":
      return wrapPhase("home", <HomeScreen />);
    case "SPLASH":
    default:
      return wrapPhase(
        "splash",
        <PremiumSplashCard source={require("@/assets/modalImages/intro.webp")} />,
      );
  }
}
