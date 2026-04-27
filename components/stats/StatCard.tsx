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
    <View className="mr-4 w-40 rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
        {icon}
      </View>
      <Text className="font-main-bold text-2xl text-white">{value}</Text>
      <Text className="mt-1 font-main-bold text-[10px] uppercase tracking-[1.5px] text-slate-500">
        {label}
      </Text>
    </View>
  );
}
