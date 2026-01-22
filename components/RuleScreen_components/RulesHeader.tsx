import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

interface Props {
  title: string;
  step: number;
  total: number;
}

export default function RulesHeader({ title, step, total }: Props) {
  return (
    <View className="flex-row justify-between items-center py-4">
      <Pressable onPress={() => router.back()} className="px-3 py-2">
        <Text className="text-gray-400 font-bold tracking-wider">EXIT</Text>
      </Pressable>

      <View className="items-center">
        <Text className="text-white font-black text-lg tracking-widest uppercase">
          {title}
        </Text>
        <Text className="text-amber-400 font-bold text-xs">
          STEP {step + 1} OF {total}
        </Text>
      </View>

      <View className="w-10" />
    </View>
  );
}
