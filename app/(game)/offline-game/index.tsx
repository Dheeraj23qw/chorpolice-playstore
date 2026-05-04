import React from "react";
import { Stack } from "expo-router";
import OfflineGameScreen from "@/screens/OfflineGame/OfflineGameScreen";

export default function OfflineGameRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <OfflineGameScreen />
    </>
  );
}
