import { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export const useSystemUI = () => {
  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === "android") {
        // 1. Hide the bar for immersion
        await NavigationBar.setVisibilityAsync("hidden");
        
        // Force app theme to dark
        Appearance.setColorScheme("dark"); 
      }
    };

    setup();
  }, []);
};