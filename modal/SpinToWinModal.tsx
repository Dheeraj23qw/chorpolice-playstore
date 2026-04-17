import React, { useEffect, memo } from "react";
import { Modal, View, Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";
import SpinWheelView from "@/features/SpinWheel/SpinWheelView";
import SpinResult from "@/features/SpinWheel/SpinResult";

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
  }));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (status === "DONE") {
      timer = setTimeout(() => {
        setShowVictory(false);
        onClose();
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [status, onClose, setShowVictory]);

  useEffect(() => {
    if (isVisible) animateModalIn();
    else reset();
  }, [isVisible, animateModalIn, reset]);

  const onSpin = () => {
    if (status === "IDLE") handleSpin();
  };

  return (
    <Modal visible={isVisible} transparent={false} animationType="fade">
      <View className="flex-1 bg-black">
        {/* 🎨 BACKGROUND IMAGE */}
        <Animated.Image
          source={require("@/assets/images/bg/image.png")}
          className="absolute h-full w-full"
          resizeMode="cover"
        />

        {/* 🌑 DARK OVERLAY */}
        <View className="absolute h-full w-full bg-black/60" />

        {/* 💜 PREMIUM INDIGO GRADIENT OVERLAY */}
        <LinearGradient
          colors={[
            "rgba(99,102,241,0.35)", // indigo glow top
            "rgba(0,0,0,0.85)", // fade to black
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          

          {/* CONTENT */}
          <Pressable onPress={onSpin} className="w-full px-6">
            <Animated.View
              style={[modalAnimatedStyle]}
              className="items-center rounded-3xl border border-white/10 bg-zinc-900/70 p-5"
            >
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
                  <Animated.Text className="text-lg font-main-bold text-white">
                    Tap anywhere to spin
                  </Animated.Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default memo(SpinController);
