import React from "react";
import { Stack } from "expo-router";
import OfflineSetupScreen from "@/screens/OfflineGame/OfflineSetupScreen";

export default function OfflineSetupRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <OfflineSetupScreen />
    </>
  );
}
