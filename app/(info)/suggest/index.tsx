import React from "react";
import { Stack } from "expo-router";
import { SuggestionScreen } from "@/screens/BugScreen/suggestion";

export default function SuggestRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SuggestionScreen />
    </>
  );
}
