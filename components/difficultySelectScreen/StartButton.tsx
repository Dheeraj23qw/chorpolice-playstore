import React, { memo } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";

type Props = {
  label: string;
  onPress: () => void;
};

const StartButton = ({ label, onPress }: Props) => {
  return (
    <View className="shadow-2xl shadow-indigo-500/60">
      <Pressable
        onPress={onPress}
        style={{ height: hp(7.5) }}
        className="active:scale-[0.97] active:opacity-90 transition-all overflow-hidden rounded-2xl bg-indigo-600 border-b-4 border-indigo-800"
      >
        <View className="flex-1 px-8 flex-row items-center justify-center relative">
          {/* Shine Effect */}
          <View className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/30" />

          <Text
            style={{ fontSize: rf(1.8) }}
            // Changed 'font-black' to 'font-main-bold' for the Outfit-Bold shield
            className="text-white font-main-bold tracking-[4px] uppercase"
          >
            {label}
          </Text>

          <View
            style={{ width: wp(8), height: wp(8) }}
            className="ml-4 bg-indigo-500 rounded-full items-center justify-center border border-white/20"
          >
            <Ionicons name="chevron-forward" size={rf(2)} color="white" />
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default memo(StartButton);