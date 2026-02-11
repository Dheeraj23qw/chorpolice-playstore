import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";

export default function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <View className="w-40 rounded-[32px] bg-slate-900 p-6 border border-slate-800 shadow-sm mr-4">
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
        {icon}
      </View>
      <Text className="text-2xl font-main-bold text-white">{value}</Text>
      <Text className="mt-1 text-[10px] text-slate-500 font-main-bold uppercase tracking-[1.5px]">
        {label}
      </Text>
    </View>
  );
}
