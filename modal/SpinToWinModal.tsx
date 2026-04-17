import React, { useEffect, memo } from "react";
import { Modal, View, Pressable } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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
    opacity: scaleAnim.value,
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
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-transparent">
        {/* 🎨 YOUR ORIGINAL BACKGROUND (UNCHANGED) */}
        <Animated.Image
          source={require("@/assets/images/bg/image.png")}
          className="absolute h-full w-full"
          resizeMode="cover"
        />

        {/* 💜 YOUR ORIGINAL GRADIENT (UNCHANGED) */}
        <LinearGradient
          colors={["rgba(99,102,241,0.35)", "rgba(0,0,0,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          {/* 🧊 ONLY THIS BECOMES GLASS */}
          <Pressable onPress={onSpin} className="w-full px-6">
            <Animated.View style={modalAnimatedStyle}>
              <View className="overflow-hidden rounded-3xl">
                {/* GLASS LAYER */}
                <BlurView
                  intensity={30}
                  tint="dark"
                  className="absolute h-full w-full"
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
                  className="absolute h-full w-full"
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
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default memo(SpinController);
