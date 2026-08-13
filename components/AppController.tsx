import React, { useCallback, useEffect, useRef } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Linking, View, TouchableOpacity, StyleSheet } from "react-native";

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
  getUpdateDismissCount,
  incrementUpdateDismissCount,
} from "@/storage/appStorage";
import { canShowLowCoinModal } from "@/storage/lowCoinStorage";
import { runAfterUI } from "@/utils/runAfterUI";


import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { warmupSpeech } from "@/service/QuizNarrationService";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { ReconnectOverlay } from "./ReconnectOverlay";

let hasWarmupFired = false;

export default function AppController() {
  const {
    isUpdating,
    nativeUpdate,
    otaAvailable,
    applyUpdate,
    setOtaAvailable,
  } = useOTAUpdate();

  const [skippedUpdate, setSkippedUpdate] = React.useState(false);

  const dispatch = useAppDispatch();
  const phase = useAppSelector((state) => state.appFlow.phase);
  const activeModal = useAppSelector((state) => state.modalQueue.activeModal);
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
    // Enable global audio lifecycle protection
    AudioEngine.enableBackgroundProtection();
  }, []);

  useEffect(() => {
    // Auto-grant the 25k app-download bonus once, silently (no modal).
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

  if (otaAvailable && !skippedUpdate && isInitialFlow) {
    return wrapPhase(
      "otaUpdate",
      <View
        style={{
          flex: 1,
          backgroundColor: "#050508",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <PremiumSplashCard
          source={require("@/assets/modalImages/intro.webp")}
        />
        <View className="absolute inset-0 bg-black/60" />

        <View className="items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 shadow-xl shadow-emerald-500/40">
            <Text className="text-4xl">✨</Text>
          </View>
          <Text
            style={{ fontSize: rf(2.4) }}
            className="mb-2 text-center font-main-bold text-white"
          >
            Quick Update Ready!
          </Text>
          <Text
            style={{ fontSize: rf(1.1) }}
            className="mb-8 text-center leading-5 text-white/50"
          >
            We&apos;ve prepared some improvements for you. A quick restart is
            required to apply them.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => applyUpdate()}
            className="h-16 w-64 items-center justify-center overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={StyleSheet.absoluteFill}
            />
            <Text className="font-main-bold text-lg text-white">
              RESTART NOW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSkippedUpdate(true)}
            className="mt-4 h-12 w-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
          >
            <Text className="font-main-bold text-sm text-white/60">
              NOT NOW
            </Text>
          </TouchableOpacity>
        </View>
      </View>,
    );
  }

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
}
