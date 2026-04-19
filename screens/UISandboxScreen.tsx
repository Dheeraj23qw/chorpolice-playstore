import { LowCoinModal } from "@/features/lowCoinReward";
import React, { useState, useEffect } from "react";
import { View, StatusBar } from "react-native";

export default function UIViewer() {
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    // Show the modal after a short delay
    const timer = setTimeout(() => setShowUI(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <StatusBar hidden />

      <LowCoinModal
        visible={showUI}
        onClose={() => {
          // Restart to see entrance animation again
          setShowUI(false);
          setTimeout(() => setShowUI(true), 800);
        }}
        onShare={() => console.log("Share Pressed")}
        onRate={() => console.log("Rate Pressed")}
        onDisable={() => setShowUI(false)}
      />
    </View>
  );
}
