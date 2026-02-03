import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "../Text";

interface Props {
  title: string;
  step: number;
  total: number;
}

export default function RulesHeader({ title, step, total }: Props) {
  return (
    <View className="flex-row justify-between items-center py-4">
      <Pressable onPress={() => router.back()} className="px-3 py-2">
        {/* Swapped font-bold for font-main-bold */}
        <Text className="text-gray-400 font-main-bold tracking-wider">EXIT</Text>
      </Pressable>

      <View className="items-center">
        <Text 
          // Swapped font-black for font-main-bold
          className="text-white font-main-bold text-lg tracking-widest uppercase"
        >
          {title}
        </Text>
        <Text 
          // Swapped font-bold for font-main-bold
          className="text-amber-400 font-main-bold text-xs"
        >
          STEP {step + 1} OF {total}
        </Text>
      </View>

      {/* Spacer to maintain center alignment of the middle View */}
      <View className="w-10" />
    </View>
  );
}