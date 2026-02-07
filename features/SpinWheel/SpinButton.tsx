import React, { memo, useState, useEffect, useMemo } from "react";
import { TouchableOpacity, View, Vibration } from "react-native";
import { Text } from "@/components/Text";
import { SpinButtonProps } from "./types";
import { useTimeoutManager } from "@/hooks/useTimeOutManager";

const SpinButton = ({ status, onSpin, onClose }: SpinButtonProps) => {
  const isSpinning = status === "SPINNING";
  const isDone = status === "DONE";

  const [isReady, setIsReady] = useState(false);
  const { safeSetTimeout } = useTimeoutManager(false);

  useEffect(() => {
    if (isDone) {
      safeSetTimeout(() => {
        setIsReady(true);
        Vibration.vibrate([0, 40, 40]);
      }, 3500);
    } else {
      setIsReady(false);
    }
  }, [isDone, safeSetTimeout]);

  const handlePress = () => {
    if (isSpinning) return;
    if (isDone) {
      if (isReady) onClose();
      return;
    }
    Vibration.vibrate(10);
    onSpin();
  };

  const buttonStyle = useMemo(() => {
    const base = "w-full h-20 rounded-full items-center justify-center border-b-[6px] active:border-b-0 active:translate-y-[2px]";
    
    if (isSpinning) return `${base} bg-zinc-800 border-zinc-950 opacity-60`;
    if (isDone) {
      return isReady 
        ? `${base} bg-green-500 border-green-700 shadow-xl shadow-green-500/40`
        : `${base} bg-zinc-700 border-zinc-800 opacity-80`;
    }
    return `${base} bg-indigo-500 border-indigo-700 shadow-xl shadow-indigo-500/40`;
  }, [isSpinning, isDone, isReady]);

  const labelText = isSpinning 
    ? "Spinning..." 
    : isDone 
      ? (isReady ? "Claim Reward 🎉" : "Preparing...") 
      : "Spin & Win 🎡";

  return (
    <View className="w-full px-6 gap-y-5">
      <TouchableOpacity
        onPress={handlePress}
        disabled={isSpinning || (isDone && !isReady)}
        activeOpacity={0.9}
        className={buttonStyle}
      >
        <Text className={`font-main-bold text-[18px] tracking-[3px] uppercase ${isDone && isReady ? "text-green-950" : "text-white"}`}>
          {labelText}
        </Text>
      </TouchableOpacity>

      {/* Footer Exit */}
      {!isReady && !isSpinning && (
        <TouchableOpacity
          onPress={onClose}
          className="py-2 items-center self-center"
          hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
        >
          <Text className="text-zinc-500 font-main-md text-[11px] tracking-[3px] uppercase text-center">
            {isDone ? "Almost Ready..." : "Maybe Later"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(SpinButton);