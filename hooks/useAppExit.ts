import { useEffect } from "react";
import { BackHandler, Platform, Alert } from "react-native";

export const useAppExit = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true }
      );

      return true; // Prevent default behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, []);
};
