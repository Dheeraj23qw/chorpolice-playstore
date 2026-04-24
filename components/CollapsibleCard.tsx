import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
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
      {/* 🔥 PRESSABLE WITH SCALE FEEDBACK */}
      <Pressable onPress={onToggle}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed ? 0.97 : 1 }}
            transition={{ type: "timing", duration: 120 }}
            className="flex-row items-center justify-between rounded-3xl border border-white/10 bg-white/[0.08] p-5"
          >
            <View className="flex-row items-center">
              {/* ICON */}
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                <Ionicons name={icon} size={20} color="#818cf8" />
              </View>

              <View>
                <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white/40">
                  {label}
                </Text>

                <Text className="font-main-bold text-base text-white">
                  {isOpen ? "CLOSE SELECTOR" : title}
                </Text>
              </View>
            </View>

            {/* 🔄 ROTATING CHEVRON */}
            <MotiView
              animate={{ rotate: isOpen ? "180deg" : "0deg" }}
              transition={{ type: "timing", duration: 250 }}
            >
              <Ionicons name="chevron-down" size={24} color="white" />
            </MotiView>
          </MotiView>
        )}
      </Pressable>

      {/* 🔥 EXPAND / COLLAPSE ANIMATION */}
      <AnimatePresence>
        {isOpen && (
          <MotiView
            from={{ opacity: 0, translateY: -10, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -10, scale: 0.98 }}
            transition={{ type: "timing", duration: 250 }}
            className="mt-4 overflow-hidden"
          >
            {/* INNER CONTENT (OPTIONAL STAGGER READY) */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 100 }}
            >
              {children}
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};
