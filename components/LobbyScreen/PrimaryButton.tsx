import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, Platform, View } from "react-native";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";

interface PrimaryButtonProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  subtitle,
  onPress,
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      {({ pressed }) => (
        <MotiView
          animate={{
            scale: pressed ? 0.97 : 1,
            opacity: disabled ? 0.6 : 1,
          }}
          transition={{
            type: "spring",
            damping: 18,
            stiffness: 250,
          }}
          className="w-full"
        >
          {/* 🔥 OUTER GLOW */}
          {!disabled && (
            <View className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-2xl" />
          )}

          {/* 🌫 GLASS BUTTON */}
          <View className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
            {/* 🔥 GRADIENT LAYER (SUBTLE) */}
            <LinearGradient
              colors={
                disabled
                  ? ["rgba(255,255,255,0.05)", "rgba(0,0,0,0.1)"]
                  : [
                      "rgba(99,102,241,0.35)",
                      "rgba(79,70,229,0.15)",
                      "rgba(0,0,0,0.2)",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="px-6 py-5">
                {/* ✨ TOP LIGHT LINE */}
                <View className="absolute left-6 right-6 top-0 h-[1px] bg-white/40" />

                {/* 🎯 CONTENT */}
                <Text
                  className={`text-center font-main-bold text-[17px] tracking-tight ${
                    disabled ? "text-white/40" : "text-white"
                  }`}
                >
                  {title}
                </Text>

                <Text
                  className={`mt-1 text-center text-[11px] uppercase tracking-[1.5px] ${
                    disabled ? "text-white/30" : "text-indigo-200/80"
                  }`}
                >
                  {subtitle}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </MotiView>
      )}
    </Pressable>
  );
};
