import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable } from "react-native";

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
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 400 }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="overflow-hidden rounded-[28px] active:scale-95 transition-transform"
      >
        <LinearGradient
          colors={
            disabled
              ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
              : ["#2563EB", "#4F46E5"]
          }
          className="rounded-[28px] border border-white/10 px-5 py-5"
        >
          <Text
            className={`text-center font-main-bold text-lg tracking-[1px] ${
              disabled ? "text-white/45" : "text-white"
            }`}
          >
            {title}
          </Text>
          <Text
            className={`mt-1 text-center text-xs leading-5 ${
              disabled ? "text-white/25" : "text-white/75"
            }`}
          >
            {subtitle}
          </Text>
        </LinearGradient>
      </Pressable>
    </MotiView>
  );
};
