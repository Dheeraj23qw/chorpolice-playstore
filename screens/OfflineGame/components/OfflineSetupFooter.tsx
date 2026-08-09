import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { hp, rf } from "@/utils/responsive";

interface OfflineSetupFooterProps {
  onPress: () => void;
}

export const OfflineSetupFooter: React.FC<OfflineSetupFooterProps> = ({
  onPress,
}) => {
  return (
    <View
      style={{ paddingBottom: hp(3.5) }}
      className="absolute bottom-0 left-0 right-0 px-5 pt-5"
    >
      <BlurView
        intensity={28}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute left-0 right-0 top-0 h-px bg-white/10" />

      <TouchableOpacity
        activeOpacity={0.86}
        onPress={onPress}
        className="h-16 overflow-hidden rounded-[26px]"
      >
        <LinearGradient
          colors={["#818CF8", "#6366F1", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />
        <View className="absolute inset-0 bg-white/8" />
        <View className="flex-1 flex-row items-center justify-center">
          <Text
            style={{ fontSize: rf(1.65) }}
            className="font-main-bold uppercase tracking-[2px] text-white"
          >
            Start Game
          </Text>
          <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
