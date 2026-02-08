import React, { useState, useRef, useEffect, memo } from "react";
import { Modal, View, Animated } from "react-native";
import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";
import SpinHeader from "@/features/SpinWheel/SpinHeader";
import VictoryOverlay from "@/features/SpinWheel/VictoryOverlay";
import SpinWheelView from "@/features/SpinWheel/SpinWheelView";
import SpinResult from "@/features/SpinWheel/SpinResult";
import SpinButton from "@/features/SpinWheel/SpinButton";

interface SpinControllerProps {
  isVisible: boolean;
  onClose: () => void;
}

const SpinController: React.FC<SpinControllerProps> = ({ isVisible, onClose }) => {
  const {
    status,
    result,
    showVictory,
    spinAnim,
    scaleAnim,
    pulseAnim,
    segments,
    setShowVictory,
    handleSpin,
    reset,
    animateModalIn,
  } = useSpinWheel();

  // ✅ Auto-close after 3s when result is done
  useEffect(() => {
    let timer: number;
    if (status === "DONE") {
      timer = setTimeout(() => {
        setShowVictory(false); // hide victory overlay
        onClose(); // close modal
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [status, onClose, setShowVictory]);

  useEffect(() => {
    if (isVisible) animateModalIn();
    else reset();
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View className="flex-1 bg-zinc-950">
        <VictoryOverlay visible={showVictory} onComplete={() => setShowVictory(false)} />

        <Animated.View
          style={{ flex: 1, transform: [{ scale: scaleAnim }] }}
          className="items-center justify-between pb-12 pt-16"
        >
          {/* Header */}
          <View className="w-full px-8 items-center">
            <SpinHeader status={status} result={result} />
          </View>

          {/* Wheel */}
          <View className="w-full items-center justify-center">
            <SpinWheelView spinAnim={spinAnim} segments={segments} />
          </View>

          {/* Result & Button */}
          <View className="w-full px-8 items-center">
            <SpinResult status={status} result={result} pulseAnim={pulseAnim} />
            <View className="w-full mt-6">
              <SpinButton status={status} onSpin={handleSpin} onClose={onClose} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(SpinController);
