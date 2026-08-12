import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";

interface AppBannerCardProps {
  onPress: () => void;
  icon: React.ReactNode;
  iconGlowClassName?: string;
  iconContainerClassName?: string;
  title: string;
  titleColor?: string;
  badge?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  description: string;
  descriptionColor?: string;
  ctaContent: React.ReactNode;
  ctaContainerClassName?: string;
  borderColor?: string;
  shadowColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
  shimmerColors?: readonly [string, string, ...string[]];
  className?: string;
}

export const AppBannerCard: React.FC<AppBannerCardProps> = ({
  onPress,
  icon,
  iconGlowClassName = "absolute -inset-1.5 rounded-2xl bg-amber-400/15",
  iconContainerClassName = "h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/20",
  title,
  titleColor = "text-amber-400",
  badge,
  badgeBgColor = "bg-amber-400/20",
  badgeTextColor = "text-amber-300",
  description,
  descriptionColor = "text-white/70",
  ctaContent,
  ctaContainerClassName = "h-10 w-10 items-center justify-center rounded-xl border border-amber-300/70 bg-amber-500 shadow-lg shadow-amber-500/40",
  borderColor = "border-amber-400/40",
  shadowColor = "shadow-amber-500/25",
  gradientColors = [
    "rgba(251,191,36,0.15)",
    "rgba(217,119,6,0.08)",
    "transparent",
  ],
  shimmerColors = [
    "transparent",
    "rgba(251,191,36,0.35)",
    "transparent",
  ],
  className = "mx-5 mb-4",
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 140 }}
      className={className}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        className={`overflow-hidden rounded-3xl border ${borderColor} bg-slate-950/90 shadow-2xl ${shadowColor}`}
      >
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Gradient overlay */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Shimmer accent line at top */}
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 1, width: "100%" }}
        />

        <View className="flex-row items-center px-4 py-3.5">
          {/* Icon container */}
          <View className="relative">
            {/* Glow ring */}
            <MotiView
              from={{ opacity: 0.4, scale: 0.9 }}
              animate={{ opacity: 0.8, scale: 1.15 }}
              transition={{
                type: "timing",
                duration: 1500,
                loop: true,
              }}
              className={iconGlowClassName}
            />
            <View className={iconContainerClassName}>
              {icon}
            </View>
          </View>

          {/* Text content */}
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className={`font-main-bold text-[10px] uppercase tracking-[2px] ${titleColor}`}>
                {title}
              </Text>
              {badge && (
                <View className={`ml-2 rounded-md ${badgeBgColor} px-1.5 py-0.5`}>
                  <Text className={`font-main-bold text-[9px] ${badgeTextColor}`}>
                    {badge}
                  </Text>
                </View>
              )}
            </View>
            <Text className={`mt-0.5 font-main-medium text-[12px] tracking-wide ${descriptionColor}`}>
              {description}
            </Text>
          </View>

          {/* CTA */}
          <View className={ctaContainerClassName}>
            {ctaContent}
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};
