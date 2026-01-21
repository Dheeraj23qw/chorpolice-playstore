import "../global.css";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import store from "@/redux/store";
import { Platform, Text, TextInput } from "react-native"; 
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from 'expo-navigation-bar';

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
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync("hidden");
      }

      // --- GLOBAL DEFAULT FONT CONFIG ---
      const globalConfig = {
        allowFontScaling: true,
        maxFontSizeMultiplier: 1.1, // Capped growth
        style: { fontFamily: 'outfit' } // YOUR DEFAULT FONT
      };

      // @ts-ignore - Applies font to every <Text> automatically
      Text.defaultProps = { ...(Text.defaultProps || {}), ...globalConfig };
      // @ts-ignore - Applies font to every <TextInput> automatically
      TextInput.defaultProps = { ...(TextInput.defaultProps || {}), ...globalConfig };
    }

    if (fontsLoaded) {
      setupSystemUI();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
}