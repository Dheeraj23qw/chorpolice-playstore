import React, { useRef, useEffect } from "react";
import { Pressable, View, Animated } from "react-native";
import { rf } from "@/utils/responsive";
import { Text } from "../Text";

interface PlayButtonProps {
  disabled: boolean;
  onPress: () => void;
  buttonText: string;
  variant?: "primary" | "secondary";
}

/* ===============================
   🔥 Variant Config (Clean Architecture)
================================== */

const BUTTON_VARIANTS = {
  primary: {
    containerEnabled: "bg-indigo-600 border border-indigo-400/40",
    containerDisabled: "bg-[#08080c] border border-white/5",
    textEnabled: "text-white",
    textDisabled: "text-white/25",
    bottomWidth: 6,
    bottomColorEnabled: "#312e81",
    bottomColorDisabled: "#141418",
    showGlow: true,
  },
  secondary: {
    containerEnabled: "bg-white/5 border border-white/15",
    containerDisabled: "bg-white/5 border border-white/10",
    textEnabled: "text-indigo-300",
    textDisabled: "text-white/25",
    bottomWidth: 2,
    bottomColorEnabled: "#ffffff20",
    bottomColorDisabled: "#ffffff10",
    showGlow: false,
  },
} as const;

/* =============================== */

const PlayButton: React.FC<PlayButtonProps> = ({
  disabled,
  onPress,
  buttonText,
  variant = "primary",
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const config = BUTTON_VARIANTS[variant];

  /* 🌊 Glow breathing (only if enabled for variant) */
  useEffect(() => {
    if (!disabled && config.showGlow) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.35,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      );

      loop.start();
      return () => loop.stop();
    }
  }, [disabled, variant,config.showGlow,glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.965,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className="w-full pt-8 px-2"
    >
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="w-full"
      >
        {/* 🌟 Glow (Primary Only) */}
        {!disabled && config.showGlow && (
          <Animated.View
            pointerEvents="none"
            style={{ opacity: glowAnim }}
            className="absolute -inset-3 rounded-[36px] bg-indigo-500/30 blur-3xl"
          />
        )}

        {/* 🧊 Button Body */}
        <View
          className={`rounded-[30px] overflow-hidden ${
            disabled
              ? config.containerDisabled
              : config.containerEnabled
          }`}
          style={{
            borderBottomWidth: config.bottomWidth,
            borderBottomColor: disabled
              ? config.bottomColorDisabled
              : config.bottomColorEnabled,
          }}
        >
          <View className="py-6 items-center justify-center">
            <Text
              style={{ fontSize: rf(1.9) }}
              className={`font-main-bold uppercase tracking-[4px] ${
                disabled
                  ? config.textDisabled
                  : config.textEnabled
              }`}
            >
              {buttonText}
            </Text>

            {!disabled && variant === "primary" && (
              <Text className="mt-1 text-[9px] tracking-[3px] uppercase text-indigo-300/60 font-main-md">
                Tap to continue
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(PlayButton);
