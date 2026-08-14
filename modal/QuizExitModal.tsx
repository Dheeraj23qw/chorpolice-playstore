import React, { useEffect, useRef } from "react";
import { Modal, View, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { MotiText, MotiView } from "moti";
import * as Haptics from "expo-haptics";

interface QuizExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isHost: boolean;
  isMultiplayer: boolean;
  currentRound: number;
  totalRounds: number;
}

export default function QuizExitModal({
  visible,
  onCancel,
  onConfirm,
  isHost,
  isMultiplayer,
  currentRound,
  totalRounds,
}: QuizExitModalProps) {
  const tapped = useRef(false);

  useEffect(() => {
    if (visible) {
      tapped.current = false;
    }
  }, [visible]);

  const safeTap = (action: () => void) => {
    if (tapped.current) return;

    tapped.current = true;
    action();

    setTimeout(() => {
      tapped.current = false;
    }, 600);
  };

  const handleCancel = () => {
    if (tapped.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeTap(onCancel);
  };

  const handleConfirm = () => {
    if (tapped.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeTap(onConfirm);
  };

  const isHostExit = isHost && isMultiplayer;

  const title = isHostExit ? "End Game?" : "Leave Game?";

  const description = isHostExit
    ? "Leaving will end the game for everyone. Your stake coins are lost."
    : isMultiplayer
      ? "The game will continue without you. Your stake coins are lost."
      : "Are you sure you want to quit?";

  const confirmLabel = isHostExit
    ? "End Game & Exit"
    : isMultiplayer
      ? "Leave Game"
      : "Quit";

  const confirmIcon = isHostExit ? "skull-outline" : "exit-outline";

  const headerIcon = isHostExit ? "warning-outline" : "log-out-outline";

  const progress =
    totalRounds > 0 ? Math.min(Math.max(currentRound / totalRounds, 0), 1) : 0;

  const progressWidth = `${progress * 100}%` as `${number}%`;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* BACKDROP */}
        <View pointerEvents="none" className="absolute inset-0 bg-black/80" />

        <Pressable className="absolute inset-0" onPress={handleCancel} />

        {/* CARD */}
        <MotiView
          from={{
            opacity: 0,
            scale: 0.9,
            translateY: 24,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            translateY: 12,
          }}
          transition={{
            type: "spring",
            damping: 22,
            stiffness: 170,
          }}
          className="w-full max-w-[430px]"
          style={{
            shadowColor: isHostExit ? "#EF4444" : "#6366F1",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.22,
            shadowRadius: 30,
            elevation: 25,
          }}
        >
          {/* GLOWING BORDER */}
          <View
            className={`overflow-hidden rounded-[40px] border p-[1px] ${
              isHostExit
                ? "border-red-400/40 bg-red-500/[0.05]"
                : "border-indigo-400/30 bg-indigo-500/[0.04]"
            }`}
            style={{
              shadowColor: isHostExit ? "#EF4444" : "#6366F1",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.38,
              shadowRadius: 18,
              elevation: 18,
            }}
          >
            {/* GLASS */}
            <BlurView
              intensity={90}
              tint="dark"
              className="overflow-hidden rounded-[39px]"
            >
              {/* CARD */}
              <View className="rounded-[39px] bg-[#0F0F15]/90 px-7 pb-7 pt-7">
                {/* ICON */}
                <MotiView
                  from={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 18,
                    stiffness: 160,
                    delay: 100,
                  }}
                  className="mb-6 self-start"
                  style={{
                    shadowColor: isHostExit ? "#EF4444" : "#6366F1",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <View
                    className={`rounded-full border p-[2px] ${
                      isHostExit
                        ? "border-red-300/35 bg-red-500/[0.08]"
                        : "border-indigo-300/30 bg-indigo-500/[0.08]"
                    }`}
                  >
                    <View
                      className={`h-16 w-16 items-center justify-center rounded-full border ${
                        isHostExit
                          ? "border-red-400/20 bg-red-500/[0.10]"
                          : "border-indigo-400/20 bg-indigo-500/[0.10]"
                      }`}
                    >
                      <Ionicons
                        name={headerIcon}
                        size={30}
                        color={isHostExit ? "#F87171" : "#818CF8"}
                      />
                    </View>
                  </View>
                </MotiView>

                {/* EYEBROW */}
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 250,
                    delay: 140,
                  }}
                  className={`font-main-bold text-[10px] uppercase tracking-[3px] ${
                    isHostExit ? "text-red-400/65" : "text-indigo-400/65"
                  }`}
                >
                  {isHostExit ? "Host Action" : "Leaving Game"}
                </MotiText>

                {/* HEADING */}
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 10,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 170,
                  }}
                  className="mt-2 font-main-bold text-[28px] leading-[34px] text-white"
                >
                  {title}
                </MotiText>

                {/* DESCRIPTION */}
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 10,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 210,
                  }}
                  className="font-main-medium mt-3 text-[15px] leading-[23px] text-white/50"
                >
                  {description}
                </MotiText>

                {/* DIVIDER */}
                <View className="my-6 h-px w-full bg-white/[0.08]" />

                {/* ROUND STATUS */}
                <MotiView
                  from={{
                    opacity: 0,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 250,
                  }}
                >
                  <View
                    className={`rounded-2xl border px-4 py-4 ${
                      isHostExit
                        ? "border-red-400/15 bg-red-500/[0.05]"
                        : "border-indigo-400/15 bg-indigo-500/[0.05]"
                    }`}
                  >
                    {/* ROUND HEADER */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-xl border ${
                            isHostExit
                              ? "border-red-400/20 bg-red-500/[0.08]"
                              : "border-indigo-400/20 bg-indigo-500/[0.08]"
                          }`}
                        >
                          <Ionicons
                            name="timer-outline"
                            size={19}
                            color={isHostExit ? "#F87171" : "#818CF8"}
                          />
                        </View>

                        <View className="ml-3">
                          <Text className="font-main-bold text-[11px] uppercase tracking-[1.5px] text-white/45">
                            Current Round
                          </Text>

                          <Text className="mt-0.5 font-main-bold text-[14px] text-white/75">
                            Round {currentRound} of {totalRounds}
                          </Text>
                        </View>
                      </View>

                      <Text
                        className={`font-main-bold text-[13px] ${
                          isHostExit ? "text-red-400" : "text-indigo-400"
                        }`}
                      >
                        {Math.round(progress * 100)}%
                      </Text>
                    </View>

                    {/* PROGRESS BAR */}
                    <View className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <View
                        className={`h-full rounded-full ${
                          isHostExit ? "bg-red-500/75" : "bg-indigo-500/75"
                        }`}
                        style={{
                          width: progressWidth,
                        }}
                      />
                    </View>
                  </View>
                </MotiView>

                {/* BUTTONS */}
                <View className="mt-5">
                  {/* CONTINUE */}
                  <Pressable
                    onPress={handleCancel}
                    className="mb-3 h-14 w-full items-center justify-center rounded-3xl border border-indigo-300/20 bg-indigo-600"
                    style={({ pressed }) => [
                      {
                        shadowColor: "#6366F1",
                        shadowOffset: {
                          width: 0,
                          height: 6,
                        },
                        shadowOpacity: 0.28,
                        shadowRadius: 12,
                        elevation: 8,
                      },
                      pressed && {
                        transform: [{ scale: 0.98 }],
                        opacity: 0.88,
                      },
                    ]}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="game-controller-outline"
                        size={19}
                        color="white"
                      />

                      <Text className="ml-2 font-main-bold text-[15px] text-white">
                        Continue Playing
                      </Text>
                    </View>
                  </Pressable>

                  {/* CONFIRM */}
                  <Pressable
                    onPress={handleConfirm}
                    className={`h-14 w-full items-center justify-center rounded-3xl border ${
                      isHostExit
                        ? "border-red-300/30 bg-red-500"
                        : "border-red-400/25 bg-red-500/[0.08]"
                    }`}
                    style={({ pressed }) => [
                      {
                        shadowColor: "#EF4444",
                        shadowOffset: {
                          width: 0,
                          height: isHostExit ? 7 : 0,
                        },
                        shadowOpacity: isHostExit ? 0.35 : 0.12,
                        shadowRadius: isHostExit ? 14 : 10,
                        elevation: isHostExit ? 10 : 3,
                      },
                      pressed && {
                        transform: [{ scale: 0.98 }],
                        opacity: 0.88,
                      },
                    ]}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={confirmIcon}
                        size={18}
                        color={isHostExit ? "#FFFFFF" : "#F87171"}
                      />

                      <Text
                        className={`ml-2 font-main-bold text-[14px] ${
                          isHostExit ? "text-white" : "text-red-400"
                        }`}
                      >
                        {confirmLabel}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </BlurView>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
