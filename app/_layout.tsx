import "../global.css";
import React, { useEffect } from "react";
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

/* ---------------- App Layout ---------------- */

function AppLayout() {
  useEffect(() => {
    // Always ensure quiz BGM when app becomes active
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (!AudioEngine.isMuted()) {
          AudioEngine.ensureQuizGlobal();
        }
      }
    });

    // Also check immediately on mount
    if (!AudioEngine.isMuted()) {
      AudioEngine.ensureQuizGlobal();
    }

    return () => {
      sub.remove();
    };
  }, []);

  const loader = useSelector((state: RootState) => state.loader);

  useAppExit();

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" }, // ✅ WHITE
        }}
      >
        <Stack.Screen name="index" />
      </Stack>

      <RouteLoader />
      <GlobalLoader visible={loader.visible} message={loader.message} />
    </View>
  );
}

/* ---------------- Root Layout ---------------- */

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
    outfit: require("../assets/fonts/Outfit-Regular.ttf"),
    "myfont-bold": require("../assets/fonts/YanoneKaffeesatz-Bold.ttf"),
    myfont: require("../assets/fonts/YanoneKaffeesatz-Medium.ttf"),
  });

  useSystemUI();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
    backgroundColor: "#FFFFFF", // ✅ GLOBAL WHITE
  },
});
