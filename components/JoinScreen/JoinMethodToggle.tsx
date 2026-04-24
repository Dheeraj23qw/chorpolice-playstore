import React from "react";
import { View } from "react-native";
import TogglePill from "./TogglePill";

export const JoinMethodToggle = ({ joinMethod, setJoinMethod }: any) => (
  <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-white/5 p-1">
    <TogglePill
      selected={joinMethod === "scan"}
      label="Scan QR"
      onPress={() => setJoinMethod("scan")}
    />
    <TogglePill
      selected={joinMethod === "code"}
      label="Type Code"
      onPress={() => setJoinMethod("code")}
    />
  </View>
);
