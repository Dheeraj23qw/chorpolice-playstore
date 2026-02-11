import React from "react";
import { View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Text } from "@/components/Text";

export default function Row({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between rounded-[24px] bg-slate-900/70 px-5 py-4 border border-slate-800 shadow-sm mt-2">
      <View className="flex-row items-center space-x-4">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 shadow-inner">{icon}</View>
        <Text className="font-main-md text-slate-300">{label}</Text>
      </View>
      <View className="flex-row items-center space-x-2">
        <Text className="font-main-bold text-white text-lg">{value}</Text>
        <ChevronRight size={14} color="#475569" />
      </View>
    </View>
  );
}
