import React from "react";
import { View } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { Text } from "@/components/Text";
import { BlurView } from "expo-blur";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any; // Accept component directly
  color: string;
  bg?: string;
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <View 
      className="mb-4 w-[48%] overflow-hidden rounded-[32px] border border-white/10 bg-slate-900 shadow-xl"
      style={{
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <BlurView intensity={10} tint="dark">
        <View className="p-5">
        <View
          className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5"
        >
          {Icon && <Icon size={20} color={color} />}
        </View>
        
        <View>
          <Text className="text-[9px] font-main-bold uppercase tracking-[2px] text-slate-400">
            {label}
          </Text>
          <Text className="mt-1 text-lg font-main-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
        </View>

        {/* Subtle decorative glow (blur utility removed for Android) */}
        <View 
          className="absolute -right-2 -top-2 h-12 w-12 rounded-full opacity-10"
          style={{ backgroundColor: color }}
        />
        </View>
      </BlurView>
    </View>
  );
}
