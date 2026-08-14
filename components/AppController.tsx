import React, { useCallback, useEffect, useRef } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { View } from "react-native";

import { runtimeConfig } from "@/constants/runtime";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { setAppPhase } from "@/redux/reducers/appFlowReducer";
import { claimFirstLaunchBonus } from "@/features/wallet/walletSlice";
import { loadSounds } from "@/redux/reducers/soundReducer";
import HomeScreen from "@/screens/appFlow/HomeScreen";
import OnboardingScreen from "@/screens/appFlow/OnboardingScreen";
import VideoScreen from "@/screens/appFlow/VideoScreen";
import { PremiumSplashCard } from "@/components/PremiumSplashCard";
import { assetLoader } from "@/service/assetLoader";
import { syncLocalLobbyProfile } from "@/service/lanLobbyCoordinator";
import { AudioEngine } from "@/audio/audioEngine";

import {
  getOnboardingDone,
  setOnboardingDone,
  getForceOnboardingEveryLaunch,
} from "@/storage/appStorage";
import { runAfterUI } from "@/utils/runAfterUI";

import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { warmupSpeech } from "@/service/QuizNarrationService";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { UpdateAppModal } from "@/modal/UpdateAppModal";

let hasWarmupFired = false;

export default function AppController() {
  const {
    updateState,
    isUpdating,
    latestVersion,
    updateUrl,
    isMandatory,
    applyUpdate,
  } = useOTAUpdate();

  const [skippedUpdate, setSkippedUpdate] = React.useState(false);

  const dispatch = useAppDispatch();
  const phase = useAppSelector((state) => state.appFlow.phase);
  const coins = useAppSelector((state) => state.wallet.coins);
  const firstLaunch = useAppSelector((state) => state.wallet.firstLaunch);
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);
  const connectionStatus = useAppSelector(
    (state) => state.session.connectionStatus,
  );
  const loadingTaskRef = useRef<Promise<void> | null>(null);
  const bootstrappedRef = useRef(false);
  const firstLaunchBonusRef = useRef(false);

  const prepareIntroFlow = useCallback(() => {
    if (loadingTaskRef.current) return loadingTaskRef.current;

    const task = (async () => {
      try {
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 2500)),
          isSoundLoaded
            ? Promise.resolve()
            : dispatch(loadSounds())
                .unwrap()
                .catch(() => undefined),
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

    if (phase === "HOME") return;

    runAfterUI(() => {
      const shouldShowOnboarding =
        runtimeConfig.forceOnboardingEveryLaunch ||
        (__DEV__ && getForceOnboardingEveryLaunch()) ||
        !getOnboardingDone();

      if (shouldShowOnboarding) {
        dispatch(setAppPhase("ONBOARDING"));
        return;
      }

      void prepareIntroFlow();
    });
  }, [dispatch, prepareIntroFlow, phase]);

  useEffect(() => {
    AudioEngine.enableBackgroundProtection();
  }, []);

  useEffect(() => {
    if (phase === "HOME" && firstLaunch && !firstLaunchBonusRef.current) {
      firstLaunchBonusRef.current = true;
      dispatch(claimFirstLaunchBonus());
    }
  }, [dispatch, firstLaunch, phase]);

  useEffect(() => {
    if (connectionStatus !== "IDLE") {
      syncLocalLobbyProfile({ coins });
    }
  }, [coins, connectionStatus]);

  useEffect(() => {
    if (phase === "HOME" && !hasWarmupFired) {
      hasWarmupFired = true;
      void warmupSpeech();
    }
  }, [phase]);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDone(true);
    void prepareIntroFlow();
  }, [prepareIntroFlow]);

  const handleVideoComplete = useCallback(() => {
    dispatch(setAppPhase("HOME"));
  }, [dispatch]);

  const wrapPhase = (key: string | undefined, child: React.ReactNode) => (
    <Animated.View
      key={key}
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(500)}
      style={{ flex: 1 }}
    >
      {child}
    </Animated.View>
  );

  const isInitialFlow = phase === "SPLASH" || phase === "VIDEO" || phase === "ONBOARDING";

  const showUpdateModal =
    (updateState.status === "native-update" || updateState.status === "ota-ready") &&
    (!skippedUpdate || isMandatory) &&
    (isInitialFlow || isMandatory);

  const renderedPhase = (() => {
    if (isUpdating) {
      return wrapPhase(
        "applyingUpdate",
        <View
          style={{
            flex: 1,
            backgroundColor: "#050508",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PremiumSplashCard
            source={require("@/assets/modalImages/intro.webp")}
          />
          <View style={{ position: "absolute", bottom: 100, alignItems: "center" }}>
            <Text
              style={{ fontSize: rf(2), color: "#fff" }}
              className="font-main-bold uppercase tracking-widest"
            >
              Applying Update...
            </Text>
            <Text
              style={{
                fontSize: rf(1.4),
                color: "rgba(255,255,255,0.5)",
                marginTop: 8,
              }}
            >
              The app will reload in a moment.
            </Text>
          </View>
        </View>,
      );
    }

    switch (phase) {
      case "ONBOARDING":
        return wrapPhase(
          "onboarding",
          <OnboardingScreen onComplete={handleOnboardingComplete} />,
        );
      case "VIDEO":
        return wrapPhase(
          "video",
          <VideoScreen onComplete={handleVideoComplete} />,
        );
      case "HOME":
        return wrapPhase("home", <HomeScreen />);
      case "SPLASH":
      default:
        return wrapPhase(
          "splash",
          <PremiumSplashCard
            source={require("@/assets/modalImages/intro.webp")}
          />,
        );
    }
  })();

  return (
    <>
      {renderedPhase}
      <UpdateAppModal
        isVisible={showUpdateModal}
        onClose={() => setSkippedUpdate(true)}
        updateUrl={updateUrl}
        latestVersion={latestVersion}
        isMandatory={isMandatory}
        isOta={updateState.status === "ota-ready"}
        onApplyOta={applyUpdate}
      />
    </>
  );
}
