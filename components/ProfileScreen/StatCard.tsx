import React from "react";
import { View } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { Text } from "@/components/Text";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof LucideIcons;
  color: string;
  bg: string;
}

export default function StatCard({ label, value, icon, color, bg }: StatCardProps) {
  const Icon = (LucideIcons as any)[icon] || LucideIcons.Activity;

  return (
    <View className="mb-4 w-[48%] rounded-[28px] bg-indigo-900/30 border border-white/10 p-5 shadow-md flex-row items-center backdrop-blur-sm">
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: bg }}
      >
        <Icon size={24} color={color} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[9px] font-main-bold uppercase text-slate-400">
          {label}
        </Text>
        <Text className="text-lg font-main-bold text-white mt-0.5">{value}</Text>
      </View>
    </View>
  );
}
