import "../global.css";
import React, { useEffect, useCallback } from "react";
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
import { AppState, View } from "react-native";
import ScreenWrapper from "@/Animations/ScreenWrapper";
import { notificationService } from "@/service/notification/NotificationService";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppLayout() {
  const { visible, message } = useSelector((state: RootState) => state.loader);

  useAppExit();

  /* ---------------- Audio Restore ---------------- */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !AudioEngine.isMuted()) {
        AudioEngine.ensureQuizGlobal?.();
      }
    });

    if (!AudioEngine.isMuted()) {
      AudioEngine.ensureQuizGlobal?.();
    }

    return () => sub.remove();
  }, []);

  /* ---------------- Notifications ---------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const granted = await notificationService.registerPermissions();
        if (!mounted || !granted) return;
        notificationService.listen();
        await notificationService.handleInitialNotification();
      } catch (e) {
        console.log("Notification setup error:", e);
      }
    })();
    return () => {
      mounted = false;
      notificationService.cleanup();
    };
  }, []);

  /* ---------------- Screen Wrapper ---------------- */
  const screenLayout = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <ScreenWrapper variant="default" breathing>
        {children}
      </ScreenWrapper>
    ),
    []
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

      <RouteLoader />
      <GlobalLoader visible={visible} message={message} />
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
      SplashScreen.hideAsync().catch(() => {});
    }
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