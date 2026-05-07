import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";

interface QuestionSectionProps {
  question: string;
  narrationEnabled: boolean;
  onToggleNarration: () => void;
  onReplay: () => void;
  onOpenSettings: () => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ 
  question, 
  narrationEnabled, 
  onToggleNarration, 
  onReplay,
  onOpenSettings
}) => {
  return (
    <View className="items-center justify-center">
      {/* Glow Effect behind the card */}
      <View
        style={{ width: wp(60), height: hp(10) }}
        className="absolute rounded-full bg-indigo-500/10 blur-3xl"
      />

      {/* Outer Border Shell */}
      <View
        style={{ width: wp(88), padding: wp(1) }}
        className="rounded-[32px] border border-white/10 bg-white/5"
      >
        {/* Inner Card (The HUD) */}
        <View
          style={{ paddingVertical: hp(4), paddingHorizontal: wp(6) }}
          className="items-center justify-center rounded-[30px] border border-white/5 bg-[#121212]/60"
        >
          {/* Controls Overlay - Bottom Right */}
          <View className="absolute right-4 bottom-4 flex-row items-center gap-3">
            <Pressable
              onPress={onToggleNarration}
              className="h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-indigo-500/20 active:scale-90"
            >
              <Ionicons
                name={narrationEnabled ? "volume-high" : "volume-mute"}
                size={rf(2.2)}
                color={narrationEnabled ? "#818cf8" : "#94a3b8"}
              />
            </Pressable>
            
            <Pressable
              onPress={onReplay}
              disabled={!narrationEnabled}
              className={`h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-indigo-500/20 active:scale-90 ${!narrationEnabled ? 'opacity-30' : ''}`}
            >
              <Ionicons name="refresh" size={rf(2.2)} color="#818cf8" />
            </Pressable>

            <Pressable
              onPress={onOpenSettings}
              className="h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-indigo-500/20 active:scale-90"
            >
              <Ionicons name="settings-outline" size={rf(2.2)} color="#818cf8" />
            </Pressable>
          </View>

          {/* Decorative Corner Accent (Top Left) */}
          <View className="absolute left-4 top-4 h-3 w-3 border-l-2 border-t-2 border-indigo-500/50" />
          
          <Text
            style={{
              fontSize: rf(2.4),
              lineHeight: rf(3.2),
              marginBottom: hp(4), // Space for the controls at the bottom
            }}
            className="text-center font-main-bold tracking-tight text-white"
            numberOfLines={6}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {question || "Loading your next challenge..."}
          </Text>

          {/* Bottom Aesthetic Detail (Moved left or removed to avoid overlap) */}
          <View className="absolute left-6 bottom-6 flex-row items-center">
            <View className="h-[1px] w-4 bg-white/10" />
            <View className="mx-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <View className="h-[1px] w-4 bg-white/10" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default QuestionSection;
