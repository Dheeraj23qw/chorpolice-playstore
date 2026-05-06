import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface OfflineStartConfirmModalProps {
  visible: boolean;
  playerCount: number;
  totalRounds: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const OfflineStartConfirmModal: React.FC<
  OfflineStartConfirmModalProps
> = ({ visible, playerCount, totalRounds, onClose, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <BlurView
          intensity={18}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />

        <MotiView
          from={{ scale: 0.92, opacity: 0, translateY: 16 }}
          animate={{ scale: 1, opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 220 }}
          className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#090B14]"
        >
          <LinearGradient
            colors={[
              "rgba(99,102,241,0.24)",
              "rgba(255,255,255,0.03)",
              "rgba(9,11,20,1)",
            ]}
            className="absolute inset-0"
          />

          <View className="p-7">
            <View className="mx-auto mb-5 h-18 w-18 items-center justify-center rounded-[26px] border border-white/10 bg-white/10">
              <Ionicons
                name="game-controller-outline"
                size={34}
                color="white"
              />
            </View>

            <Text
              style={{ fontSize: rf(2.25) }}
              className="text-center font-main-bold text-white"
            >
              Ready to Start?
            </Text>

            <Text
              style={{ fontSize: rf(1.1), lineHeight: rf(1.8) }}
              className="mt-2 text-center font-main-md text-white/45"
            >
              Check names, avatars, and rounds one last time before the game
              begins.
            </Text>

            <View className="mb-6 mt-6 flex-row gap-x-3">
              <View className="flex-1 rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <Text
                  style={{ fontSize: rf(0.92) }}
                  className="font-main-bold uppercase tracking-[2px] text-white/35"
                >
                  Players
                </Text>
                <Text
                  style={{ fontSize: rf(1.18) }}
                  className="mt-1 font-main-bold text-white"
                >
                  {playerCount} Friends
                </Text>
              </View>

              <View className="flex-1 rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <Text
                  style={{ fontSize: rf(0.92) }}
                  className="font-main-bold uppercase tracking-[2px] text-white/35"
                >
                  Rounds
                </Text>
                <Text
                  style={{ fontSize: rf(1.18) }}
                  className="mt-1 font-main-bold text-white"
                >
                  {totalRounds} Total
                </Text>
              </View>
            </View>

            <View className="gap-y-3">
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={onClose}
                className="h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8"
              >
                <Text
                  style={{ fontSize: rf(1.18) }}
                  className="font-main-bold text-white/85"
                >
                  Edit Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={onConfirm}
                className="h-16 overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={["#818CF8", "#6366F1", "#4F46E5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0"
                />
                <View className="flex-1 flex-row items-center justify-center">
                  <Text
                    style={{ fontSize: rf(1.35) }}
                    className="font-main-bold uppercase tracking-[1.5px] text-white"
                  >
                    Start Now
                  </Text>
                  <Ionicons
                    name="play"
                    size={17}
                    color="white"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
