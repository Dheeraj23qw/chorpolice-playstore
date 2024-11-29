import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import store from "@/redux/store";
import { StatusBar } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
    outfit: require("../assets/fonts/Outfit-Regular.ttf"),
    "myfont-bold": require("../assets/fonts/YanoneKaffeesatz-Bold.ttf"),
    myfont: require("../assets/fonts/YanoneKaffeesatz-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <StatusBar
        barStyle="light-content" // Adjusts the text/icon color to light (for dark background)
        translucent={true} // Makes the status bar transparent
        backgroundColor="transparent" // Sets background color to transparent
        networkActivityIndicatorVisible={true} // Shows an activity indicator while network requests are loading
        showHideTransition="fade" // Controls the transition effect (e.g., "fade" or "slide")
        animated={true} // Makes the status bar changes animate
      />

      <Stack>
        <Stack.Screen name="index" />
      </Stack>
    </Provider>
  );
}
