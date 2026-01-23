import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeBackButtonProps {
  topOffset?: number;
  leftOffset?: number;
}

export const SafeBackButton = ({
  topOffset = 12,
  leftOffset = 16,
}: SafeBackButtonProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + topOffset,
        left: insets.left + leftOffset,
        zIndex: 50,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => router.back()}
        className="w-11 h-11 rounded-full bg-black/60 items-center justify-center active:scale-95"
      >
        <ChevronLeft size={26} color="grey" />
      </Pressable>
    </View>
  );
};
