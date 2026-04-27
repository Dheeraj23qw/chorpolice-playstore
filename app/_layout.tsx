import "../styles/global.css";
import React, { useEffect, useCallback } from "react";
import { Provider, useSelector } from "react-redux";
import { SplashScreen, Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppState, View } from "react-native";

import store, { RootState } from "@/redux/store";
import { useSystemUI } from "@/hooks/useSystemUI";
import { AudioEngine } from "@/audio/audioEngine";
import ScreenWrapper from "@/Animations/ScreenWrapper";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { runAfterUI } from "@/utils/runAfterUI";
import AppExitModal from "@/modal/AppExitModal";
import { useAppExit } from "@/hooks/useAppExit";
import ModalRoot from "@/components/ModalRoot";
import NotificationController from "@/components/NotificationController";

import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppLayout() {
  const { exitVisible, hideExitModal, exitApp } = useAppExit();
  const appPhase = useSelector((state: RootState) => state.appFlow.phase);
  const isSoundLoaded = useSelector((state: RootState) => state.sound.isLoaded);
  const pathname = usePathname();

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
    ({ children }: { children: React.ReactNode }) => (
      pathname === "/" ? (
        <>{children}</>
      ) : (
        <ScreenWrapper variant="default" breathing>
          {children}
        </ScreenWrapper>
      )
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      runAfterUI(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-[#050508] items-center justify-center">
        <Text className="text-white text-4xl font-main-bold tracking-[10px] uppercase">
          Chor Police
        </Text>
        <View className="h-1 w-20 bg-indigo-600 mt-4 rounded-full" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GlobalErrorBoundary>
          <StatusBar hidden translucent backgroundColor="transparent" />
          <AppLayout />
          <ToastProvider />
        </GlobalErrorBoundary>
      </SafeAreaProvider>
    </Provider>
  );
}
