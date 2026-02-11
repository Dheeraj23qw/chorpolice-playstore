import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";

export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-8">
      <Text className="mb-4 px-1 text-[12px] font-main-bold uppercase tracking-[2px] text-slate-500">
        {title}
      </Text>
      <View className="space-y-3">{children}</View>
    </View>
  );
}
