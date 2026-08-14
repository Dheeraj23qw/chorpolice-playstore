import React from "react";
import { View, Modal, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { MotiText, MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";

interface BoostScoreModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const BoostScoreModal: React.FC<BoostScoreModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAccept();
  };

  const handleDecline = () => {
    Haptics.selectionAsync();
    onDecline();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDecline}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* BACKDROP */}
        <View pointerEvents="none" className="absolute inset-0 bg-black/80" />

        <Pressable className="absolute inset-0" onPress={handleDecline} />

        {/* MODAL */}
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
            shadowColor: "#F59E0B",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 25,
          }}
        >
          {/* GLOWING OUTER BORDER */}
          <View
            className="overflow-hidden rounded-[40px] border border-amber-300/35 bg-amber-500/[0.05] p-[1px]"
            style={{
              shadowColor: "#FBBF24",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.42,
              shadowRadius: 20,
              elevation: 18,
            }}
          >
            {/* GLASS */}
            <BlurView
              intensity={95}
              tint="dark"
              className="overflow-hidden rounded-[39px]"
            >
              {/* CARD */}
              <View className="rounded-[39px] bg-[#0F0F15]/90 px-7 pb-7 pt-7">
                {/* HEADER ICON */}
                <MotiView
                  from={{
                    scale: 0,
                    opacity: 0,
                    rotate: "-12deg",
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: "0deg",
                  }}
                  transition={{
                    type: "spring",
                    damping: 16,
                    stiffness: 160,
                    delay: 100,
                  }}
                  className="mb-6 self-start"
                  style={{
                    shadowColor: "#FBBF24",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 0.55,
                    shadowRadius: 18,
                    elevation: 12,
                  }}
                >
                  <View className="rounded-full border border-amber-300/35 bg-amber-500/[0.06] p-[2px]">
                    <View className="h-16 w-16 items-center justify-center rounded-full border border-amber-400/25 bg-amber-500/[0.12]">
                      <Ionicons name="rocket" size={29} color="#FBBF24" />
                    </View>
                  </View>
                </MotiView>

                {/* TITLE */}
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
                  Boost Your Score
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
                  Take the chance to increase your score and climb higher on the
                  leaderboard.
                </MotiText>

                {/* DIVIDER */}
                <View className="my-6 h-px w-full bg-white/[0.08]" />

                {/* POTENTIAL REWARD */}
                <MotiView
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
                    delay: 250,
                  }}
                >
                  <View className="flex-row items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-4">
                    {/* LEFT */}
                    <View className="flex-row items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                        <Ionicons
                          name="trophy-outline"
                          size={20}
                          color="#FBBF24"
                        />
                      </View>

                      <View className="ml-3">
                        <Text className="font-main-bold text-[11px] uppercase tracking-[1.5px] text-white/50">
                          Reward
                        </Text>

                        <Text className="mt-0.5 text-[11px] text-white/30">
                          Score points
                        </Text>
                      </View>
                    </View>

                    {/* RIGHT */}
                    <View className="items-end">
                      <Text
                        className="font-main-bold text-[22px] text-amber-400"
                        numberOfLines={1}
                      >
                        +8,000
                      </Text>

                      <Text className="text-[10px] uppercase tracking-[1.5px] text-white/30">
                        Points
                      </Text>
                    </View>
                  </View>
                </MotiView>

                {/* ACTIVATE BUTTON */}
                <Pressable
                  onPress={handleAccept}
                  className="mt-6 h-14 w-full items-center justify-center rounded-3xl border border-amber-300/40 bg-amber-400"
                  style={({ pressed }) => [
                    {
                      shadowColor: "#FBBF24",
                      shadowOffset: {
                        width: 0,
                        height: 7,
                      },
                      shadowOpacity: 0.42,
                      shadowRadius: 15,
                      elevation: 10,
                    },
                    pressed && {
                      transform: [{ scale: 0.98 }],
                      opacity: 0.88,
                    },
                  ]}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="flash" size={19} color="#111111" />

                    <Text className="ml-2 font-main-bold text-[14px] uppercase tracking-[2.5px] text-black">
                      Let's Go!
                    </Text>
                  </View>
                </Pressable>

                {/* SKIP */}
                <Pressable
                  onPress={handleDecline}
                  className="mt-4 self-center px-5 py-2"
                >
                  {({ pressed }) => (
                    <Text
                      className={`text-[12px] uppercase tracking-[2px] ${
                        pressed ? "text-white/70" : "text-white/35"
                      }`}
                    >
                      Skip
                    </Text>
                  )}
                </Pressable>
              </View>
            </BlurView>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
