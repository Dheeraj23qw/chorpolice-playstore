import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import { Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics"; // Highly recommended for modern feel

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
  // Memoized colors for smooth Reanimated performance
  const colors = useMemo(() => {
    if (disabled) return ["#1E293B", "#0F172A"] as const;
    return ["#4F46E5", "#3730A3"] as const; // Deep, modern indigo palette
  }, [disabled]);

  const handlePress = () => {
    if (!disabled) {
      // Light haptic feedback makes the button feel "clickable"
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: disabled ? 0.98 : 1,
      }}
      transition={{ type: "spring", damping: 15 }}
      className="w-full"
    >
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        // NativeWind 4.0 style: using dynamic scale for interaction
        className={`overflow-hidden rounded-3xl shadow-lg transition-transform duration-100 active:scale-[0.97] ${
          disabled ? "opacity-60" : "opacity-100"
        }`}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="border-[1.5px] border-white/20 px-6 py-4"
        >
          {/* Top highlight line for a "glassmorphism" effect */}
          <MotiView className="absolute left-0 right-0 top-0 h-[1px] bg-white/30" />

          <Text
            className={`text-center font-main-bold text-[17px] tracking-tight ${
              disabled ? "text-slate-400" : "text-white"
            }`}
          >
            {title}
          </Text>

          <Text
            className={`font-main-medium mt-0.5 text-center text-[11px] uppercase tracking-[1.5px] ${
              disabled ? "text-slate-500" : "text-indigo-200/80"
            }`}
          >
            {subtitle}
          </Text>
        </LinearGradient>
      </Pressable>
    </MotiView>
  );
};
