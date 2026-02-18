import { useEffect } from "react";
import { Appearance, Platform, AppState, AppStateStatus } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";

export const useSystemUI = () => {
  useEffect(() => {
    const applySystemStyles = async () => {
      if (Platform.OS === "android") {
        await SystemUI.setBackgroundColorAsync("#050508");

       
        await NavigationBar.setVisibilityAsync("hidden");
        
        await NavigationBar.setBackgroundColorAsync("#050508");
        await NavigationBar.setButtonStyleAsync("light");

        Appearance.setColorScheme("dark");
      }
    };

    applySystemStyles();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        applySystemStyles();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => subscription.remove();
  }, []);
};