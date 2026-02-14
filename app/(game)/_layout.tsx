import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // 🔥 Prevent swipe-back during game
        animation: "fade",     // smoother transitions
      }}
    />
  );
}
