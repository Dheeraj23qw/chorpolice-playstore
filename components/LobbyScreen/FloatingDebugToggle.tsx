import React from "react";
import { Pressable, View } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { rf } from "@/utils/responsive";

interface FloatingDebugToggleProps {
  onToggle: () => void;
  isOpen: boolean;
}

export const FloatingDebugToggle: React.FC<FloatingDebugToggleProps> = ({ onToggle, isOpen }) => {
  return (
    <MotiView
      animate={{ 
        scale: 1,
        rotate: isOpen ? "90deg" : "0deg"
      }}
      className="absolute bottom-6 right-6 z-[999]"
    >
      <Pressable
        onPress={onToggle}
        className="h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-2xl shadow-black/50"
        style={{ backgroundColor: isOpen ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.05)" }}
      >
        <Ionicons 
          name={isOpen ? "close-outline" : "bug-outline"} 
          size={rf(2.2)} 
          color={isOpen ? "#f87171" : "rgba(255,255,255,0.3)"} 
        />
      </Pressable>
    </MotiView>
  );
};
