import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { Dialog, ALERT_TYPE } from "react-native-alert-notification";

export const useAppExit = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Exit App",
        textBody: "Are you sure you want to exit?",
        button: "Exit",
        onPressButton: () => BackHandler.exitApp(),
      });

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, []);
};
