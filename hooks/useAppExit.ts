import { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { useRouter } from "expo-router";

export const useAppExit = () => {
  const router = useRouter();

  const [exitVisible, setExitVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      // 1. Normal navigation back
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      // 2. Show premium exit modal
      setExitVisible(true);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [router]);

  const hideExitModal = () => setExitVisible(false);

  const exitApp = () => {
    BackHandler.exitApp();
  };

  return {
    exitVisible,
    hideExitModal,
    exitApp,
  };
};
