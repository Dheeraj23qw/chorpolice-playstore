import React, { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

import { LinearGradient } from "expo-linear-gradient";

export interface QuizAction {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  visible?: boolean;
}

interface QuizFloatingActionsProps {
  actions: QuizAction[];
}

export const QuizFloatingActions = ({ actions }: QuizFloatingActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleAction = useCallback((onPress: () => void) => {
    onPress();
    setIsOpen(false);
  }, []);

  const visibleActions = actions.filter((a) => a.visible !== false);

  return (
    <View
      style={[
        styles.container,
        { top: insets.top + 10, right: 14 }
      ]}
    >
      <AnimatePresence>
        {isOpen && (
          <MotiView
            from={{ opacity: 0, scale: 0.5, translateY: -20, rotate: '-10deg' }}
            animate={{ opacity: 1, scale: 1, translateY: 0, rotate: '0deg' }}
            exit={{ opacity: 0, scale: 0.5, translateY: -20, rotate: '10deg' }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.menu}
          >
            <BlurView intensity={95} tint="dark" className="overflow-hidden rounded-[24px] border border-white/20 bg-slate-900/80 shadow-2xl">
              {visibleActions.map((action, index) => (
                <Pressable
                  key={action.key}
                  onPress={() => handleAction(action.onPress)}
                  className={`flex-row items-center px-5 py-4 active:bg-indigo-500/20 ${
                    index !== visibleActions.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <Ionicons name={action.icon} size={rf(2)} color="#c4b5fd" />
                  <Text
                    style={{ fontSize: rf(1.3) }}
                    className="ml-3 font-main-bold text-white uppercase tracking-widest"
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </BlurView>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Pulsing Aura */}
      {!isOpen && (
        <MotiView
          from={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            type: 'timing',
            duration: 1500,
            loop: true,
            repeatReverse: false,
          }}
          className="absolute h-12 w-12 rounded-full bg-indigo-500/30"
          style={{ top: -2, left: -2 }}
        />
      )}

      <Pressable onPress={toggleMenu} className="active:scale-90">
        <MotiView
          animate={{
            rotate: isOpen ? "90deg" : "0deg",
            backgroundColor: isOpen ? "#4f46e5" : "transparent"
          }}
          transition={{ type: 'spring', damping: 12 }}
          className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 shadow-2xl"
        >
          <LinearGradient
            colors={isOpen ? ["#4f46e5", "#3730a3"] : ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            className="absolute h-full w-full"
          />
          <BlurView intensity={20} className="h-full w-full items-center justify-center">
            <Ionicons
              name={isOpen ? "close" : "ellipsis-vertical"}
              size={rf(2.4)}
              color="white"
            />
          </BlurView>
        </MotiView>
      </Pressable>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100,
    alignItems: "flex-end",
  },
  menu: {
    marginBottom: 8,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
