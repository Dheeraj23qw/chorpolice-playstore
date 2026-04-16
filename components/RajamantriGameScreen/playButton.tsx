import React, { useRef, useEffect } from "react";
import { Pressable, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.3)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const core = useRef(new Animated.Value(0)).current;

  /* ⚡ ENERGY LOOP */
  useEffect(() => {
    if (disabled) return;

    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: false,
          }),
          Animated.timing(glow, {
            toValue: 0.3,
            duration: 1100,
            useNativeDriver: false,
          }),
        ]),

        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1300,
            useNativeDriver: false,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1300,
            useNativeDriver: false,
          }),
        ]),

        Animated.sequence([
          Animated.timing(core, {
            toValue: 1,
            duration: 900,
            useNativeDriver: false,
          }),
          Animated.timing(core, {
            toValue: 0,
            duration: 900,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [disabled]);

  /* 🎮 PRESS FEEL */
  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      friction: 7,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      className="w-full px-2 pt-8"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {/* 🌌 OUTER ENERGY FIELD */}
        {!disabled && (
          <Animated.View
            pointerEvents="none"
            style={{
              opacity: glow,
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                },
              ],
            }}
            className="absolute -inset-8 rounded-[42px] bg-indigo-500/20 blur-3xl"
          />
        )}

        {/* 💠 MAIN BUTTON BODY */}
        <LinearGradient
          colors={
            disabled
              ? ["#0a0a0f", "#050507"]
              : ["#6366f1", "#4338ca", "#1e1b4b"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="overflow-hidden rounded-[36px] border border-white/10"
          style={{
            shadowColor: "#6366f1",
            shadowOpacity: disabled ? 0 : 0.7,
            shadowRadius: 22,
            elevation: 14,
          }}
        >
          {/* ✨ top light streak */}
          <View className="absolute left-6 right-6 top-2 h-[1px] bg-white/30" />

          {/* ⚡ inner energy core */}
          {!disabled && (
            <Animated.View
              pointerEvents="none"
              style={{
                opacity: core,
              }}
              className="absolute inset-0 bg-white/5"
            />
          )}

          <View className="items-center justify-center py-6">
            <Text
              style={{ fontSize: rf(2.1) }}
              className="font-main-bold uppercase tracking-[6px] text-white"
            >
              {buttonText}
            </Text>

            {!disabled && (
              <Text className="mt-1 text-[10px] uppercase tracking-[4px] text-indigo-200/70">
                Tap to deploy
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* 🔻 grounded shadow (integrated feel) */}
        <Animated.View
          style={{
            opacity: glow,
          }}
          className="mx-8 h-4 rounded-b-[36px] bg-black/50 blur-2xl"
        />
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(PlayButton);
