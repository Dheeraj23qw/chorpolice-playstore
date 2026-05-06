import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "../Text";
import { rf } from "@/utils/responsive";

interface QuizLanguageToggleProps {
  isHindi: boolean;
  onToggle: () => void;
}

export const QuizLanguageToggle: React.FC<QuizLanguageToggleProps> = ({
  isHindi,
  onToggle,
}) => {
  return (
    <Pressable
      onPress={onToggle}
      className="mb-6 overflow-hidden rounded-[30px] active:scale-[0.98]"
    >
      <LinearGradient
        colors={
          isHindi
            ? // Playful, bright orange for Hindi
              ["rgba(251,146,60,0.28)", "rgba(194,65,12,0.20)"]
            : // Bright, friendly blue for English
              ["rgba(96,165,250,0.28)", "rgba(30,64,175,0.20)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-[30px] border border-white/15"
      >
        {/* Softer background overlay */}
        <View className="absolute inset-0 bg-black/15" />

        {/* Increased overall padding for a better tap target (py-5) */}
        <View className="flex-row items-center justify-between px-5 py-5">
          <View className="mr-4 flex-1 flex-row items-center">
            <View
              // Slightly larger icon container for kid friendliness
              className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl ${
                isHindi ? "bg-orange-400/20" : "bg-blue-400/20"
              }`}
            >
              <Ionicons
                name="language" // Changed from language-outline for a bolder, kid-friendly feel
                size={24} // Increased size
                color={isHindi ? "#fb923c" : "#60a5fa"}
              />
            </View>

            <View className="flex-1">
              <Text
                style={{ fontSize: rf(1.3) }}
                className="font-main-bold text-white"
              >
                {isHindi ? "Hinglish Mode" : "English Mode"}
              </Text>
              <Text
                style={{ fontSize: rf(1.05) }}
                className="mt-1 font-main-md text-white/70" // Increased opacity for readability
              >
                {isHindi
                  ? "Questions Hindi + English mix me"
                  : "Tap karke Hinglish me dekho"}
              </Text>
            </View>
          </View>

          {/* Cleaned up toggle segment (removed border, changed background) */}
          <View className="flex-row items-center rounded-full bg-white/10 p-1">
            <View
              className={`rounded-full px-4 py-2 ${
                !isHindi ? "bg-blue-500" : "bg-transparent"
              }`}
            >
              <Text
                style={{ fontSize: rf(1.0) }}
                className={`font-main-bold uppercase ${
                  !isHindi ? "text-white" : "text-white/60"
                }`}
              >
                EN
              </Text>
            </View>
            <View
              className={`rounded-full px-4 py-2 ${
                isHindi ? "bg-orange-500" : "bg-transparent"
              }`}
            >
              <Text
                style={{ fontSize: rf(1.0) }}
                className={`font-main-bold ${
                  isHindi ? "text-white" : "text-white/60"
                }`}
              >
                MIX
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
