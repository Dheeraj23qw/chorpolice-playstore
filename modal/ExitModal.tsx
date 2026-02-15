import React, { useEffect, useRef } from "react";
import { Modal, View, TouchableOpacity, Animated, Easing } from "react-native";
import { Text } from "@/components/Text";
import { LogOut } from "lucide-react-native";

interface ExitConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ExitConfirmationModal({
  visible,
  onCancel,
  onConfirm,
}: ExitConfirmationModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal transparent visible animationType="none">
      <View className="flex-1 items-center justify-center bg-black/80 p-6">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm items-center"
        >
          {/* Rotating Glow */}
          <Animated.View
            style={{ transform: [{ rotate: spin }] }}
            className="absolute -top-10 h-80 w-80 opacity-20"
          >
            <View className="absolute h-full w-full rounded-full bg-red-500/30" />
          </Animated.View>

          {/* Main Card */}
          <View className="w-full items-center rounded-[40px] border-4 border-white/10 bg-[#111827] p-8 shadow-2xl">
            
            {/* Icon */}
            <View className="absolute -top-14 self-center">
              <View className="rounded-full bg-[#111827] p-3 border-4 border-white/10 shadow-xl">
                <View className="h-24 w-24 items-center justify-center rounded-full bg-red-500 shadow-lg">
                  <LogOut size={46} color="white" strokeWidth={2.5} />
                </View>
              </View>
            </View>

            <View className="mt-16 items-center">
              <Text className="text-xs font-main-bold uppercase tracking-widest text-white/50">
                Exit Game
              </Text>

              <Text className="mt-3 text-xl font-main-bold text-white text-center">
                Are you sure you want to exit?
              </Text>
            </View>

            {/* Buttons */}
            <View className="mt-8 w-full flex-row justify-between gap-4">
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onCancel}
                className="flex-1 rounded-2xl bg-white/5 border border-white/10 py-4"
              >
                <Text className="text-center text-sm font-main-bold uppercase text-white/70">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onConfirm}
                className="flex-1 rounded-2xl bg-red-500 py-4 shadow-lg shadow-red-500/40"
              >
                <Text className="text-center text-sm font-main-bold uppercase text-white">
                  Exit
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
