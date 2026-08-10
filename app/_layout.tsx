import "../styles/global.css";
import React, { useEffect, useCallback } from "react";
import { Provider, useSelector } from "react-redux";
import { SplashScreen, Stack, router, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppState, View, StyleSheet } from "react-native";

import store, { RootState } from "@/redux/store";
import { useSystemUI } from "@/hooks/useSystemUI";
import { AudioEngine } from "@/audio/audioEngine";
import ScreenWrapper from "@/Animations/ScreenWrapper";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import AppExitModal from "@/modal/AppExitModal";
import { useAppExit } from "@/hooks/useAppExit";
import ModalRoot from "@/components/ModalRoot";
import NotificationController from "@/components/NotificationController";
import { GlobalReconnectOverlay } from "@/components/multiplayer/GlobalReconnectOverlay";

import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { PremiumSplashCard } from "@/components/PremiumSplashCard";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppLayout() {
  const { exitVisible, hideExitModal, exitApp } = useAppExit();
  const appPhase = useSelector((state: RootState) => state.appFlow.phase);
  const isSoundLoaded = useSelector((state: RootState) => state.sound.isLoaded);
  const pathname = usePathname();

  // Whenever we're back on the home screen, collapse the navigation stack so
  // the back button / hardware back exits the app instead of revisiting a game.
  useEffect(() => {
    if (pathname === "/" && router.canDismiss()) {
      router.dismissAll();
    }
  }, [pathname]);

  useEffect(() => {
    const handleAppState = (state: string) => {
      if (
        state === "active" &&
        appPhase === "HOME" &&
        isSoundLoaded &&
        !AudioEngine.isMuted()
      ) {
        AudioEngine.ensureQuizGlobal?.();
      }
    };

    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [appPhase, isSoundLoaded]);

  const screenLayout = useCallback(
    ({ children }: { children: React.ReactNode }) =>
      pathname === "/" ? (
        <>{children}</>
      ) : (
        <ScreenWrapper variant="default" breathing>
          {children}
        </ScreenWrapper>
      ),
    [pathname],
  );

  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: "#050508" },
        }}
        screenLayout={screenLayout}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(game)" />
        <Stack.Screen name="(social)" />
        <Stack.Screen name="(info)" />
      </Stack>

      <AppExitModal
        visible={exitVisible}
        onCancel={hideExitModal}
        onConfirm={exitApp}
      />
      <NotificationController />
      <ModalRoot />
      <GlobalReconnectOverlay />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
    outfit: require("../assets/fonts/Outfit-Regular.ttf"),
    "myfont-bold": require("../assets/fonts/YanoneKaffeesatz-Bold.ttf"),
    myfont: require("../assets/fonts/YanoneKaffeesatz-Medium.ttf"),
  });

  useSystemUI();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-black" onLayout={onLayoutRootView}>
        <StatusBar hidden />
        <PremiumSplashCard
          source={require("../assets/modalImages/intro.webp")}
        />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GlobalErrorBoundary>
          <View className="flex-1 bg-black" onLayout={onLayoutRootView}>
            <StatusBar hidden />
            <AppLayout />
            <ToastProvider />
          </View>
        </GlobalErrorBoundary>
      </SafeAreaProvider>
    </Provider>
  );
}
