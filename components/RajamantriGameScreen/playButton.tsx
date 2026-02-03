import React, { useRef, useEffect } from "react";
import { Pressable, View, Animated } from "react-native";
import { rf } from "@/utils/responsive";
import { Text } from "../Text";

interface PlayButtonProps {
  disabled: boolean;
  onPress: () => void;
  buttonText: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  disabled,
  onPress,
  buttonText,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  /** 🌊 Ambient glow breathing */
  useEffect(() => {
    if (!disabled) {
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
        ]),
      );

      loop.start();
      return () => loop.stop();
    }
  }, [disabled]);

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
        {/* 🌟 Soft Aura Glow */}
        {!disabled && (
          <Animated.View
            pointerEvents="none"
            style={{ opacity: glowAnim }}
            className="absolute -inset-3 rounded-[36px] bg-indigo-500/20 blur-3xl"
          />
        )}

        {/* 🧊 Glass Body */}
        <View
          className={`rounded-[30px] overflow-hidden ${
            disabled
              ? "bg-[#08080c] border border-white/5"
              : "bg-[#0c0c12] border border-white/10"
          }`}
          style={{
            borderBottomWidth: disabled ? 1 : 5,
            borderBottomColor: disabled ? "#141418" : "#1e1b4b",
          }}
        >
          {/* ✨ Gradient Wash */}
          {!disabled && (
            <View className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-indigo-500/10" />
          )}

          {/* 💎 Inner Glow Border */}
          {!disabled && (
            <View className="absolute inset-[1px] rounded-[28px] border border-indigo-400/20" />
          )}

          {/* 🎯 Content */}
          <View className="py-6 items-center justify-center">
            <Text
              style={{ fontSize: rf(1.9) }}
              // Swapped font-extrabold for font-main-bold
              className={`font-main-bold uppercase tracking-[4px]  ${
                disabled ? "text-white/25" : "text-white"
              }`}
            >
              {buttonText}
            </Text>

            {!disabled && (
              <Text 
                // Swapped font-semibold for font-main-md
                className="mt-1 text-[9px] tracking-[3px] uppercase text-indigo-300/60 font-main-md"
              >
                Tap to continue
              </Text>
            )}
          </View>

          {/* 🌈 Top Light Reflection */}
          {!disabled && (
            <View className="absolute top-0 left-10 right-10 h-[1px] bg-white/30" />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(PlayButton);