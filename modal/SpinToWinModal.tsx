import React, { useEffect, memo } from "react";
import { Modal, View, Animated, Image } from "react-native";
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
  }, [isVisible, animateModalIn, reset]);

  return (
      <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black/95 justify-center items-center ">
        
        <VictoryOverlay
          visible={showVictory}
          onComplete={() => setShowVictory(false)}
        />

        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-zinc-950 rounded-[60px] border border-indigo-500/30 w-full max-w-sm items-center pb-10 shadow-2xl"
        >
          <View className="p-8 w-full items-center">

            <SpinHeader status={status} result={result} />

            <SpinWheelView
              spinAnim={spinAnim}
              segments={segments}
            />

            <SpinResult
              status={status}
              result={result}
              pulseAnim={pulseAnim}
            />

            <SpinButton
              status={status}
              onSpin={handleSpin}
              onClose={onClose}
            />

          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(SpinController);
