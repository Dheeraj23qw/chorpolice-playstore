import React from "react";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface BoostScoreModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const BoostScoreModal: React.FC<BoostScoreModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onDecline}
  >
    <BlurView intensity={36} tint="dark" className="absolute inset-0" />

    <View className="flex-1 items-center justify-center bg-[#04050f]/60 px-5">
      <View className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#4B548E] bg-[#101225]">
        <View className="items-center p-5">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl border border-[#7C83E8] bg-[#27275B]">
            <Ionicons name="rocket" size={rf(4)} color="#C7D2FE" />
          </View>

          <Text
            style={{ fontSize: rf(2.65) }}
            className="text-center font-main-bold text-white"
          >
            Boost your score?
          </Text>
          <Text
            style={{ fontSize: rf(1.3), lineHeight: rf(1.8) }}
            className="mt-1 text-center font-main-bold text-indigo-100"
          >
            4 quick rounds. Win up to 8,000 points.
          </Text>

          <View className="mt-4 w-full rounded-2xl border border-[#505A9F] bg-[#1A1D38] p-4">
            <Text
              style={{ fontSize: rf(1.05) }}
              className="mb-3 text-center font-main-bold tracking-[1.4px] text-indigo-300"
            >
              QUICK RULES
            </Text>

            <View className="flex-row items-center rounded-xl bg-emerald-400/10 px-3 py-2">
              <Ionicons name="checkmark-circle" size={rf(1.8)} color="#4ADE80" />
              <Text
                style={{ fontSize: rf(1.1) }}
                className="ml-2 font-main-bold text-emerald-100"
              >
                Correct  +2,000
              </Text>
            </View>

            <View className="mt-2 flex-row items-center rounded-xl bg-red-400/10 px-3 py-2">
              <Ionicons name="close-circle" size={rf(1.8)} color="#F87171" />
              <Text
                style={{ fontSize: rf(1.1) }}
                className="ml-2 font-main-bold text-red-100"
              >
                Wrong  −2,000
              </Text>
            </View>

            <View className="mt-2 flex-row items-center rounded-xl bg-amber-400/10 px-3 py-2">
              <Ionicons name="time" size={rf(1.8)} color="#FACC15" />
              <Text
                style={{ fontSize: rf(1.1) }}
                className="ml-2 font-main-bold text-amber-100"
              >
                No answer  −2,000
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.84}
            onPress={onAccept}
            className="mt-4 h-14 w-full flex-row items-center justify-center overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#6366F1", "#4338CA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0"
            />
            <Ionicons name="flash" size={rf(2.1)} color="#FFFFFF" />
            <Text
              style={{ fontSize: rf(1.35) }}
              className="ml-2 font-main-bold tracking-[0.6px] text-white"
            >
              YES, BOOST MY SCORE
            </Text>
          </TouchableOpacity>

          <Pressable
            onPress={onDecline}
            className="mt-1.5 h-11 w-full items-center justify-center"
          >
            <Text
              style={{ fontSize: rf(1.12) }}
              className="font-main-bold tracking-[1px] text-[#B8BDD9]"
            >
              SKIP LEVEL 2
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);
