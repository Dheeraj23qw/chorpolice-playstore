import React, { useState, useRef, useEffect, memo } from "react";
import { Modal, View, TouchableOpacity, Animated, Image } from "react-native";
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

const SpinController: React.FC<SpinControllerProps> = ({
  isVisible,
  onClose,
}) => {
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

  useEffect(() => {
    if (isVisible) {
      animateModalIn();
    } else {
      reset();
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="slide"> 
      {/* 1. Use bg-zinc-950 or black to fill the entire screen */}
      <View className="flex-1 bg-zinc-950">
        
        <VictoryOverlay
          visible={showVictory}
          onComplete={() => setShowVictory(false)}
        />

        {/* 2. Remove max-w-sm, rounded edges, and border for full screen immersion */}
        <Animated.View
          style={{ 
            flex: 1, // Stretch to full height
            transform: [{ scale: scaleAnim }] 
          }}
          className="items-center justify-between pb-12 pt-16"
        >
          {/* Header Section */}
          <View className="w-full px-8 items-center">
            <SpinHeader status={status} result={result} />
          </View>

          {/* Center Section: The Wheel */}
          <View className="w-full items-center justify-center">
             <SpinWheelView spinAnim={spinAnim} segments={segments} />
          </View>

          {/* Bottom Section: Result and Actions */}
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
