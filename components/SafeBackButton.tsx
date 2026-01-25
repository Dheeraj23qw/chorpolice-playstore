import React from "react";
import { View, Pressable, Platform } from "react-native";
import { router, Href } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

interface SafeBackButtonProps {
  topOffset?: number;
  leftOffset?: number;
  pushTo?: Href; 
}

/**
 * FIXED: Removed useSafeAreaInsets to prevent "displayName of undefined" crash.
 * We use Platform-specific offsets which are safer with NativeWind v4 interop.
 */
export const SafeBackButton = ({
  topOffset = Platform.OS === "ios" ? 55 : 40, 
  leftOffset = 20,
  pushTo,
}: SafeBackButtonProps) => {

  const handlePress = () => {
    // Check if we can actually go back, otherwise default to root
    if (pushTo) {
      router.push(pushTo);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View
      className="absolute z-50"
      style={{
        top: topOffset,
        left: leftOffset,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handlePress}
        // MODERN UI: Obsidian Black + Indigo Neon + Glass Highlight
        className="w-12 h-12 items-center justify-center rounded-2xl bg-[#08080a] border-t-[1.5px] border-l-[1.5px] border-white/20 active:scale-90 shadow-2xl shadow-indigo-500"
      >
        {/* Physical Depth Layer (The "Slab" effect) */}
        <View className="absolute inset-0 rounded-2xl border-b-[3.5px] border-r-[1px] border-black/60" />

        {/* Inner Glow Overlay */}
        <View className="absolute inset-0 rounded-2xl bg-indigo-500/5" />
        
        <ChevronLeft 
          size={28} 
          color="#818cf8" // Electric Indigo
          strokeWidth={3.5} 
        />
      </Pressable>
    </View>
  );
};