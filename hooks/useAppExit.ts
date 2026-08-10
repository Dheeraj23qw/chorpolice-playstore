import { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { usePathname } from "expo-router";

export const useAppExit = () => {
  const pathname = usePathname();

  const [exitVisible, setExitVisible] = useState(false);

  useEffect(() => {
    // Navigation owns Android Back away from every nested route. This hook is
    // only responsible for confirming an app exit at the actual Home route.
    if (Platform.OS !== "android" || pathname !== "/") return;

    const onBackPress = () => {
      setExitVisible(true);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [pathname]);

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
