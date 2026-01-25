import React from "react";
import { View, Pressable } from "react-native";
import { router, Href } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeBackButtonProps {
  topOffset?: number;
  leftOffset?: number;
  pushTo?: Href; // Optional route prop
}

export const SafeBackButton = ({
  topOffset = 12,
  leftOffset = 16,
  pushTo,
}: SafeBackButtonProps) => {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (pushTo) {
      router.push(pushTo);
    } else {
      router.back();
    }
  };

  return (
    <View
      // Tailwind for positioning + dynamic safe area calculation
      className="absolute z-50"
      style={{
        top: insets.top + topOffset,
        left: insets.left + leftOffset,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handlePress}
        // Tailwind Only: Obsidian Glass, Indigo border, shadow glow
        className="w-12 h-12 rounded-2xl bg-[#08080a] border-t-[1.5px] border-l-[1px] border-white/20 items-center justify-center active:scale-90 shadow-2xl shadow-indigo-500/30"
      >
        <View className="absolute inset-0 rounded-2xl border-b-[3px] border-r-[1px] border-black/40" />
        
        <ChevronLeft 
          size={28} 
          color="#818cf8" // Indigo-400
          strokeWidth={3} 
        />
      </Pressable>
    </View>
  );
};