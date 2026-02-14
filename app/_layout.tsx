import "../global.css";
import React, { useEffect, useCallback, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
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
import { notificationService } from "@/service/notification/NotificationService";
import { AppDispatch } from "@/redux/store";


SplashScreen.preventAutoHideAsync().catch(() => {});

function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();

  const loaderVisible = useSelector((state: RootState) => state.loader.visible);
  const loaderMessage = useSelector((state: RootState) => state.loader.message);

  useAppExit();




  /* --------------------------------------------
   * Audio Restore On Foreground
   * -------------------------------------------- */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && !AudioEngine.isMuted()) {
        AudioEngine.ensureQuizGlobal?.();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    if (!AudioEngine.isMuted()) {
      AudioEngine.ensureQuizGlobal?.();
    }

    return () => sub.remove();
  }, []);

  /* --------------------------------------------
   * Notifications Setup
   * -------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const setupNotifications = async () => {
      try {
        const granted = await notificationService.registerPermissions();

        if (!mounted) return;

        if (granted) {
          notificationService.listen();
          await notificationService.handleInitialNotification();
        }
      } catch (error) {
        console.log("Notification setup error:", error);
      }
    };

    setupNotifications();

    return () => {
      mounted = false;
      notificationService.cleanup();
    };
  }, []);

  const renderScreenLayout = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <ScreenWrapper variant="default" breathing>
        {children}
      </ScreenWrapper>
    ),
    [],
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
        <Stack.Screen name="(game)" />
        <Stack.Screen name="(social)" />
        <Stack.Screen name="(info)" />
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

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn("Splash screen error:", e);
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AlertNotificationRoot theme="dark">
          <StatusBar hidden translucent backgroundColor="transparent" />
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
