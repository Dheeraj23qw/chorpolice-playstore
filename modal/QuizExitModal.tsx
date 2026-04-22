import React, { useRef, useEffect } from "react";
import { Modal, View, Pressable, Animated } from "react-native";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";

interface QuizExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isHost: boolean;
  isMultiplayer: boolean;
  currentRound: number;
  totalRounds: number;
}

/**
 * Premium Quiz Exit Modal
 * - Native Modal fade + lightweight Animated scale for buttery smoothness
 * - Timer & sound are paused BEFORE this opens (handled by hook)
 * - Single-tap guaranteed via ref guard
 */
export default function QuizExitModal({
  visible,
  onCancel,
  onConfirm,
  isHost,
  isMultiplayer,
  currentRound,
  totalRounds,
}: QuizExitModalProps) {
  // 🛡️ Single-tap guard
  const tapped = useRef(false);

  // Smooth card entrance
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      tapped.current = false;
      // PROD-12 FIX: defer reset to next frame — Modal visible={true} doesn't
      // guarantee the component tree is mounted before the next sync render on Android.
      requestAnimationFrame(() => {
        cardScale.setValue(0.9);
        cardOpacity.setValue(0);
        Animated.parallel([
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [visible]);

  const safeTap = (action: () => void) => {
    if (tapped.current) return;
    tapped.current = true;
    action();
    setTimeout(() => { tapped.current = false; }, 600);
  };

  const title = isHost && isMultiplayer ? "End Game?" : "Leave Game?";

  const description =
    isHost && isMultiplayer
      ? "Leaving will end the game for everyone. Your stake coins are lost."
      : isMultiplayer
        ? "The game will continue without you. Your stake coins are lost."
        : "Are you sure you want to quit?";

  const confirmLabel =
    isHost && isMultiplayer
      ? "End Game & Exit"
      : isMultiplayer
        ? "Leave Game"
        : "Quit";
  const confirmIcon: any = isHost && isMultiplayer ? "skull-outline" : "exit-outline";

  const progress = totalRounds > 0 ? currentRound / totalRounds : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => safeTap(onCancel)}
    >
      <View className="flex-1 items-center justify-center bg-black/85 px-6">
        {/* Tap outside to dismiss */}
        <Pressable
          className="absolute h-full w-full"
          onPress={() => safeTap(onCancel)}
        />

        {/* Animated Card */}
        <Animated.View
          style={{
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
            width: "100%",
            maxWidth: 380,
          }}
        >
          <View className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0f0f1a]">
            {/* ── Accent ── */}
            <View className="h-1 w-full bg-red-500/60" />

            {/* ── Header ── */}
            <View className="items-center pb-2 pt-8">
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
                <Ionicons
                  name={isHost && isMultiplayer ? "warning-outline" : "log-out-outline"}
                  size={38}
                  color="#f87171"
                />
              </View>

              <Text className="mb-1 font-main-bold text-[10px] uppercase tracking-[4px] text-red-400/60">
                {isHost && isMultiplayer ? "⚠ HOST ACTION" : "LEAVING?"}
              </Text>

              <Text className="font-main-bold text-2xl text-white">
                {title}
              </Text>
            </View>

            {/* ── Divider ── */}
            <View className="mx-8 my-3 h-[1px] bg-white/5" />

            {/* ── Body ── */}
            <View className="px-8 pb-2">
              <Text className="text-center font-main-regular text-sm leading-5 text-white/50">
                {description}
              </Text>

              <View className="mt-5 items-center">
                <View className="flex-row items-center rounded-xl bg-white/5 px-4 py-2.5">
                  <Ionicons name="timer-outline" size={14} color="rgba(255,255,255,0.3)" />
                  <Text className="ml-2 font-main-bold text-xs text-white/40">
                    Round {currentRound} / {totalRounds}
                  </Text>
                </View>

                <View className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/5">
                  <View
                    className="h-full rounded-full bg-indigo-500/60"
                    style={{ width: `${progress * 100}%` }}
                  />
                </View>
              </View>
            </View>

            {/* ── Buttons ── */}
            <View className="p-6 pt-5">
              <Pressable
                onPress={() => safeTap(onCancel)}
                className="mb-3 h-[52px] w-full items-center justify-center rounded-2xl bg-indigo-600 active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Ionicons name="game-controller-outline" size={18} color="white" />
                  <Text className="ml-2 font-main-bold text-base text-white">
                    Continue Playing
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => safeTap(onConfirm)}
                className="h-[52px] w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Ionicons name={confirmIcon} size={16} color="#f87171" />
                  <Text className="ml-2 font-main-bold text-sm text-red-400">
                    {confirmLabel}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
