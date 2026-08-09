import { useEffect } from "react";
import { Appearance, Platform, AppState, AppStateStatus } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";

export const useSystemUI = () => {
  useEffect(() => {
    const applySystemStyles = async () => {
      if (Platform.OS === "android") {
        // 🕵️ Hide the navigation bar
        await NavigationBar.setVisibilityAsync("hidden");

        NavigationBar.setStyle("light");

        Appearance.setColorScheme("dark");
      }
    };

    applySystemStyles();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        applySystemStyles();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription.remove();
  }, []);
};
