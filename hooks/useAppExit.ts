import { useEffect } from "react";
import { BackHandler, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";

export const useAppExit = () => {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      if (router.canGoBack()) {
        router.back(); // normal back
        return true;
      }

      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true }
      );

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [router]);
};
