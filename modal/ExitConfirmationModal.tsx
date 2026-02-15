import React, { useEffect, useRef } from "react";
import { Modal, TouchableOpacity, View, Animated, Easing } from "react-native";
import { Text } from "@/components/Text";
import { AlertTriangle } from "lucide-react-native";

interface QuitQuizModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  penalty: number;
}

export default function QuitQuizModal({
  visible,
  onCancel,
  onConfirm,
  penalty,
}: QuitQuizModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const closeWithAnimation = (callback: () => void) => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(callback);
  };

  return (
    <Modal transparent visible animationType="none">
      <View className="flex-1 items-center justify-center bg-black/80 p-6">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm items-center"
        >
          {/* Rotating Warning Glow */}
          <Animated.View
            style={{ transform: [{ rotate: spin }] }}
            className="absolute -top-10 h-80 w-80 opacity-20"
          >
            <View className="absolute h-full w-full rounded-full bg-red-400/30" />
          </Animated.View>

          {/* Main Card */}
          <View className="w-full items-center rounded-[40px] border-4 border-white/20 bg-[#111827] p-8 shadow-2xl">
            
            {/* Icon */}
            <View className="absolute -top-14 self-center">
              <View className="rounded-full bg-[#111827] p-3 border-4 border-white/10 shadow-xl">
                <View className="h-28 w-28 items-center justify-center rounded-full bg-red-500 shadow-lg">
                  <AlertTriangle size={56} color="white" strokeWidth={2.5} />
                </View>
              </View>
            </View>

            <View className="mt-16 items-center">
              <Text className="text-xs font-main-bold uppercase tracking-widest text-white/50">
                Warning
              </Text>

              <Text className="mt-2 text-3xl font-main-bold text-white text-center">
                Quit Quiz?
              </Text>

              <View className="my-4 h-[2px] w-12 bg-white/10" />

              <Text className="text-center text-slate-400 font-main-md">
                If you go back now, you will lose{" "}
                <Text className="text-red-400 font-main-bold">
                  {penalty} Coins
                </Text>.
                {"\n\n"}
                Do you want to continue?
              </Text>
            </View>

            {/* Buttons */}
            <View className="mt-8 w-full gap-3">
              {/* Cancel */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => closeWithAnimation(onCancel)}
                className="w-full rounded-2xl bg-slate-700 py-4"
              >
                <Text className="text-center text-lg font-main-bold text-white">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Quit */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => closeWithAnimation(onConfirm)}
                className="w-full rounded-2xl bg-red-500 py-4 shadow-lg shadow-red-500/40"
              >
                <Text className="text-center text-lg font-main-bold text-white">
                  Quit (-{penalty})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
