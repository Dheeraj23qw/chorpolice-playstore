import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack
      initialRouteName="mode-select/index"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // 🔥 Prevent swipe-back during game
        animation: "fade",     // smoother transitions
      }}
    />
  );
}
