import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import * as LucideIcons from "lucide-react-native";

interface Props {
  totalUnlocked: number;
  totalAwards: number;
}

export default function GlobalProgressCard({ totalUnlocked, totalAwards }: Props) {
  return (
    <View className="mx-5 mb-8 p-6 rounded-[32px] bg-slate-900 border border-white/5 flex-row items-center justify-between">
      <View>
        <Text className="text-white font-main-bold text-3xl">{totalUnlocked}/{totalAwards}</Text>
        <Text className="text-slate-500 text-[10px] font-main-bold uppercase tracking-widest">Global Progress</Text>
      </View>
      <View className="h-14 w-14 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20">
        <LucideIcons.Trophy size={28} color="#6366f1" />
      </View>
    </View>
  );
}
