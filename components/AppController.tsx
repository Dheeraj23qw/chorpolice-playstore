import React, { useCallback, useEffect, useRef } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { setAppPhase } from "@/redux/reducers/appFlowReducer";
import { enqueueModal } from "@/redux/reducers/modalQueueReducer";
import { loadSounds } from "@/redux/reducers/soundReducer";
import LoadingScreen from "@/screens/appFlow/LoadingScreen";
import HomeScreen from "@/screens/appFlow/HomeScreen";
import OnboardingScreen from "@/screens/appFlow/OnboardingScreen";
import SplashPhaseScreen from "@/screens/appFlow/SplashPhaseScreen";
import VideoScreen from "@/screens/appFlow/VideoScreen";
import { assetLoader } from "@/service/assetLoader";
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
  const loadingTaskRef = useRef<Promise<void> | null>(null);
  const bootstrappedRef = useRef(false);

  const prepareIntroFlow = useCallback(() => {
    if (loadingTaskRef.current) return loadingTaskRef.current;

    dispatch(setAppPhase("LOADING"));

    const task = (async () => {
      try {
        await Promise.all([
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

    runAfterUI(() => {
      const shouldShowOnboarding = __DEV__ || !getOnboardingDone();

      if (shouldShowOnboarding) {
        dispatch(setAppPhase("ONBOARDING"));
        return;
      }

      void prepareIntroFlow();
    });
  }, [dispatch, prepareIntroFlow]);

  useEffect(() => {
    if (phase === "HOME" && firstLaunch) {
      dispatch(enqueueModal("BONUS_MODAL"));
    }
  }, [dispatch, firstLaunch, phase]);

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

  useEffect(() => {
    if (phase === "HOME" && unlockedAwardsCount > 0) {
      dispatch(enqueueModal("REWARD_MODAL"));
    }
  }, [activeModal, dispatch, phase, unlockedAwardsCount]);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDone(true);
    void prepareIntroFlow();
  }, [prepareIntroFlow]);

  const handleVideoComplete = useCallback(() => {
    dispatch(setAppPhase("HOME"));
  }, [dispatch]);

  switch (phase) {
    case "ONBOARDING":
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    case "LOADING":
      return <LoadingScreen />;
    case "VIDEO":
      return <VideoScreen onComplete={handleVideoComplete} />;
    case "HOME":
      return <HomeScreen />;
    case "SPLASH":
    default:
      return <SplashPhaseScreen />;
  }
}
