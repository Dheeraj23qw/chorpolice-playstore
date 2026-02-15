import React, { useEffect, memo } from "react";
import { Modal, View } from "react-native";
// ✅ Import Reanimated components and hooks
import Animated, { useAnimatedStyle } from "react-native-reanimated"; 
import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";
import SpinHeader from "@/features/SpinWheel/SpinHeader";
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
    let timer: number;
    if (status === "DONE") {
      timer = setTimeout(() => {
        setShowVictory(false);
        onClose();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [status, onClose, setShowVictory]);

  useEffect(() => {
    if (isVisible) {
      animateModalIn();
    } else {
      reset();
    }
  }, [isVisible, animateModalIn, reset]);

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View className="flex-1 bg-zinc-950">

        <Animated.View
          style={[{ flex: 1 }, modalAnimatedStyle]}
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