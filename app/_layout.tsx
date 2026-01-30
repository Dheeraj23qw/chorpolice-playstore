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

/* ---------------- App Layout ---------------- */

function AppLayout() {
  const loader = useSelector((state: RootState) => state.loader);

  useAppExit(); 

  return (
    <>
      <Stack screenOptions={{ headerShown: false , contentStyle: { backgroundColor: "#0B0B0F" } }}>
        <Stack.Screen name="index" />
      </Stack>

      <RouteLoader />
      <GlobalLoader visible={loader.visible} message={loader.message} />
    </>
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
