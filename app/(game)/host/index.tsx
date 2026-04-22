import React from "react";
import { Stack } from "expo-router";

import HostScreen from "@/screens/HostScreen";

export default function HostRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <HostScreen />
    </>
  );
}
