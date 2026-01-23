import "../global.css";
import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import store, { RootState } from "@/redux/store";
import { Appearance, Text, TextInput } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import GlobalLoader from "@/components/globalLoader";
import RouteLoader from "@/components/RouteLoader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";


function AppLayout() {

  const loader = useSelector((state: RootState) => state.loader);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>

      <RouteLoader />

      <GlobalLoader visible={loader.visible} message={loader.message} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
    outfit: require("../assets/fonts/Outfit-Regular.ttf"),
    "myfont-bold": require("../assets/fonts/YanoneKaffeesatz-Bold.ttf"),
    myfont: require("../assets/fonts/YanoneKaffeesatz-Medium.ttf"),
  });

  useEffect(() => {
    async function setupSystemUI() {
      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync("hidden");
        Appearance.setColorScheme("light"); 
      }

      // ✅ Safe font patch
      (Text as any).defaultProps = {
        ...(Text as any).defaultProps,
        allowFontScaling: true,
        maxFontSizeMultiplier: 1.1,
        style: { fontFamily: "outfit" },
      };

      (TextInput as any).defaultProps = {
        ...(TextInput as any).defaultProps,
        allowFontScaling: true,
        maxFontSizeMultiplier: 1.1,
        style: { fontFamily: "outfit" },
      };
    }

    if (fontsLoaded) {
      setupSystemUI();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar hidden />
        <AppLayout />
      </SafeAreaProvider>
    </Provider>
  );
}
