import { useEffect } from "react";
import { Appearance, Platform, Text, TextInput } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export const useSystemUI = () => {
  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync("hidden");
        Appearance.setColorScheme("light");
      }

      // Global Font Setup
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
    };

    setup();
  }, []);
};
