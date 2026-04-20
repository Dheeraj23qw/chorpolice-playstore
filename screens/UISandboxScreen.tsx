import { OnboardingSwiper } from "@/features/Onboarding";
import React, { useState, useEffect } from "react";
import { View } from "react-native";

export default function UIViewer() {
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    // Show the modal after a short delay
    const timer = setTimeout(() => setShowUI(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <OnboardingSwiper onComplete={() => {}} />
    </View>
  );
}
