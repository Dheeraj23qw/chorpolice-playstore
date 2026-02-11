import React from "react";
import { View } from "react-native";
import { Zap } from "lucide-react-native";
import { Text } from "@/components/Text";

export default function PlayerCard({ user, progress }: { user: any; progress: number }) {
  return (
    <View className="relative overflow-hidden mb-8 rounded-[40px] bg-indigo-600 p-8 shadow-2xl shadow-indigo-500/20">
      {/* Background Decorative Element */}
      <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

      <View className="flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center space-x-2">
            <Zap size={14} color="#c7d2fe" fill="#c7d2fe" />
            <Text className="text-[10px] uppercase tracking-[2px] text-indigo-100 font-main-bold">
              Pro Rank
            </Text>
          </View>
          <Text className="mt-1 text-3xl font-main-bold text-white">
            {user.username}
          </Text>
        </View>

        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20 border border-white/30">
          <Text className="text-xl font-main-bold text-white">{user.level}</Text>
        </View>
      </View>

      {/* Level Progress */}
      <View className="mt-8">
        <View className="mb-2 flex-row justify-between items-end">
          <Text className="text-[10px] text-indigo-100 font-main-bold uppercase tracking-wider">
            Experience Points
          </Text>
          <Text className="text-xs text-white font-main-bold">
            {user.xp.toLocaleString()}{" "}
            <Text className="text-indigo-200">
              / {user.nextLevelXp.toLocaleString()} XP
            </Text>
          </Text>
        </View>

        <View className="h-3 overflow-hidden rounded-full bg-black/20">
          <View
            style={{ width: `${progress}%` }}
            className="h-full rounded-full bg-white shadow-sm shadow-white"
          />
        </View>
      </View>
    </View>
  );
}
