import "../global.css";
import React, { useEffect, useCallback, useMemo } from "react";
import { Provider, useSelector } from "react-redux";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import store, { RootState } from "@/redux/store";
import GlobalLoader from "@/components/globalLoader";
import RouteLoader from "@/components/RouteLoader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { useAppExit } from "@/hooks/useAppExit";
import { useSystemUI } from "@/hooks/useSystemUI";
import { AudioEngine } from "@/audio/audioEngine";
import { AppState, StyleSheet, View } from "react-native";
import ScreenWrapper from "@/Animations/ScreenWrapper";

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* focus error or ignore if already hidden */
});

function AppLayout() {
  const loaderVisible = useSelector((state: RootState) => state.loader.visible);
  const loaderMessage = useSelector((state: RootState) => state.loader.message);

  useAppExit();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      // Production Check: Ensure AudioEngine exists and is initialized
      if (nextAppState === "active" && AudioEngine && !AudioEngine.isMuted()) {
        AudioEngine.ensureQuizGlobal?.();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    // Initial check
    if (AudioEngine && !AudioEngine.isMuted()) {
      AudioEngine.ensureQuizGlobal?.();
    }

    return () => sub.remove();
  }, []);

  // Memoize screen layout to prevent ScreenWrapper from re-mounting 
  // every time AppLayout re-renders
  const renderScreenLayout = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <ScreenWrapper variant="default" breathing={true}>
        {children}
      </ScreenWrapper>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: "#050508" },
        }}
        screenLayout={renderScreenLayout}
      >
        <Stack.Screen name="index" />
      </Stack>

      <RouteLoader />
      <GlobalLoader visible={loaderVisible} message={loaderMessage} />
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

  // Handle Font Loading & Splash Screen
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Even if fonts fail (fontError), we hide splash to show 
      // the app with fallback fonts rather than a stuck splash screen
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Production Guard: If fonts aren't ready, we return null so the 
  // Splash Screen stays up. If they fail, we proceed anyway.
  if (!fontsLoaded && !fontError) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AlertNotificationRoot theme="dark">
          <StatusBar hidden translucent style="light" />
          <AppLayout />
        </AlertNotificationRoot>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050508",
  },
});