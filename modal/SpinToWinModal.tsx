import React, { useEffect, memo, useCallback } from "react";
import { Modal, View, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";
import SpinWheelView from "@/features/SpinWheel/SpinWheelView";
import SpinResult from "@/features/SpinWheel/SpinResult";
import { Text } from "@/components/Text";

interface SpinControllerProps {
  isVisible: boolean;
  onClose: () => void;
}

const SpinController: React.FC<SpinControllerProps> = ({
  isVisible,
  onClose,
}) => {
  const {
    status,
    result,
    spinAnim,
    scaleAnim,
    pulseAnim,
    segments,
    setShowVictory,
    handleSpin,
    reset,
    animateModalIn,
  } = useSpinWheel();

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: scaleAnim.value,
  }));

  const handleExit = useCallback(() => {
    if (status === "SPINNING") return; // 🔒 LOCKED WHILE SPINNING
    setShowVictory(false);
    onClose();
  }, [status, onClose, setShowVictory]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (status === "DONE") {
      timer = setTimeout(() => {
        handleExit();
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [status, handleExit]);

  useEffect(() => {
    if (isVisible) animateModalIn();
    else reset();
  }, [isVisible, animateModalIn, reset]);

  const handleCardPress = () => {
    if (status === "IDLE") {
      handleSpin();
    } else if (status === "DONE") {
      handleExit();
    }
  };

  const isSpinning = status === "SPINNING";

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isSpinning) handleExit();
      }}
    >
      <View className="flex-1 bg-transparent">
        {/* 🎨 BACKGROUND */}
        <Animated.Image
          source={require("@/assets/images/bg/image.webp")}
          className="absolute h-full w-full"
          resizeMode="cover"
        />

        {/* 💜 GRADIENT */}
        <LinearGradient
          colors={["rgba(99,102,241,0.35)", "rgba(0,0,0,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
          {/* ⬅️ TRANSPARENT GLASSY BACK ICON BUTTON (VISIBLE WHEN NOT SPINNING) */}
          {!isSpinning && (
            <Pressable
              onPress={handleExit}
              className="absolute left-6 top-12 z-50 h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-lg active:opacity-80"
            >
              <BlurView
                intensity={20}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>
          )}

          <View className="flex-1 items-center justify-center">
            {/* 🧊 GLASS CARD */}
            <Pressable onPress={handleCardPress} className="w-full px-6">
              <Animated.View style={modalAnimatedStyle}>
                <View className="overflow-hidden rounded-3xl">
                  {/* GLASS LAYER */}
                  <BlurView
                    intensity={30}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />

                  {/* soft reflection (glass feel) */}
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.12)",
                      "rgba(255,255,255,0.04)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* CONTENT */}
                  <View className="items-center p-5">
                    <SpinWheelView spinAnim={spinAnim} segments={segments} />

                    <View className="mt-5">
                      <SpinResult
                        status={status}
                        result={result}
                        pulseAnim={pulseAnim}
                      />
                    </View>

                    {status === "IDLE" && (
                      <View className="mt-3">
                        <Animated.Text className="font-main-bold text-lg text-white">
                          Tap on wheel to win
                        </Animated.Text>
                      </View>
                    )}

                    {status === "DONE" && (
                      <View className="mt-4 flex-row items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-600 px-8 py-3.5 shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                        <Text className="font-main-bold text-base uppercase tracking-[2px] text-white">
                          Tap to Continue
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default memo(SpinController);
