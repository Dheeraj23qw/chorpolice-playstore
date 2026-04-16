import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { Text } from "@/components/Text";

interface CollapsibleCardProps {
  isOpen: boolean;
  onToggle: () => void;
  label: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

export const CollapsibleCard = ({
  isOpen,
  onToggle,
  label,
  title,
  icon,
  children,
}: CollapsibleCardProps) => {
  return (
    <View className="mb-4">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between rounded-3xl border border-white/10 bg-white/[0.08] p-5"
      >
        <View className="flex-row items-center">
          {/* Icon Container with Indigo Glow */}
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
            <Ionicons name={icon} size={20} color="#818cf8" />
          </View>

          <View>
            <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white/40">
              {label}
            </Text>
            <Text className="uppercasetext-base font-main-bold text-white">
              {isOpen ? "CLOSE SELECTOR" : title}
            </Text>
          </View>
        </View>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="white"
        />
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(400)}
          layout={Layout.springify()}
          className="mt-4"
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
};
