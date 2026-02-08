import React, { memo, useState, useEffect } from "react";
import { TouchableOpacity, View, Vibration } from "react-native";
import { Text } from "@/components/Text";
import { SpinButtonProps } from "./types";
import { useTimeoutManager } from "@/hooks/useTimeOutManager";

const SpinButton = ({ status, onSpin, onClose }: SpinButtonProps) => {
  const isSpinning = status === "SPINNING";
  const isDone = status === "DONE";

  const [ready, setReady] = useState(false);
  const { safeSetTimeout } = useTimeoutManager(false);

  // 🔹 Handle anticipation for done state
  useEffect(() => {
    if (isDone) {
      safeSetTimeout(() => {
        setReady(true);
        Vibration.vibrate([0, 40, 40]); // celebratory buzz
      }, 2500); // shorter anticipation for smooth feel
    } else {
      setReady(false);
    }
  }, [isDone, safeSetTimeout]);

  const handlePress = () => {
    if (isSpinning) return;

    if (isDone && ready) {
      onClose(); // auto close after animation
      return;
    }

    // Normal spin
    Vibration.vibrate(10);
    onSpin();
  };

  // 🔹 Dynamic styling
  const buttonClass = isSpinning
    ? "w-full h-20 rounded-full items-center justify-center bg-zinc-800 border-b-4 border-zinc-950 opacity-60"
    : isDone
    ? "w-full h-20 rounded-full items-center justify-center bg-indigo-600 border-b-4 border-indigo-800 shadow-xl shadow-indigo-500/40"
    : "w-full h-20 rounded-full items-center justify-center bg-indigo-500 border-b-4 border-indigo-700 shadow-xl shadow-indigo-500/40";

  const buttonText = isSpinning
    ? "Spinning..."
    : isDone
    ? "Done 🎉"
    : "Spin & Win 🎡";

  return (
    <View className="w-full px-6 gap-y-5">
      <TouchableOpacity
        onPress={handlePress}
        disabled={isSpinning || (isDone && !ready)}
        activeOpacity={0.9}
        className={buttonClass}
      >
        <Text className={`font-main-bold text-[18px] tracking-[3px] uppercase text-white`}>
          {buttonText}
        </Text>
      </TouchableOpacity>

      {/* Optional Footer */}
      {!isSpinning && !ready && (
        <TouchableOpacity
          onPress={onClose}
          className="py-2 items-center self-center"
          hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
        >
          <Text className="text-zinc-500 font-main-md text-[11px] tracking-[3px] uppercase text-center">
            Maybe Later
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(SpinButton);
