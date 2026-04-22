import React from "react";
import { Stack } from "expo-router";

import JoinScreen from "@/screens/JoinScreen";

export default function JoinRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <JoinScreen />
    </>
  );
}
