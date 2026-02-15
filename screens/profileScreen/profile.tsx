import React from "react";
import { View, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { Text } from "@/components/Text";

const { width } = Dimensions.get("window");

// Hardcoded image URL - Swap this whenever you're ready
const USER_IMAGE = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop";

export default function UserProfile() {
  const stats = [
    { label: "HIGH SCORE", value: "24,500", icon: "Trophy", color: "text-yellow-400" },
    { label: "RANK", value: "#42", icon: "Zap", color: "text-purple-400" },
    { label: "COINS", value: "1,250", icon: "Coins", color: "text-orange-400" },
    { label: "MULTIPLIER", value: "x12", icon: "Flame", color: "text-red-500" },
  ];

  const recentAwards = [
    { id: 1, icon: "Star", color: "#fbbf24" },
    { id: 2, icon: "Shield", color: "#60a5fa" },
    { id: 3, icon: "Crown", color: "#a78bfa" },
    { id: 4, icon: "Gem", color: "#f472b6" },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* 1. ARCADE HEADER SECTION */}
      <View className="relative h-72 w-full items-center justify-end pb-6">
        {/* Glow Effects */}
        <View className="absolute -top-10 h-64 w-full bg-indigo-600/20 blur-3xl opacity-50" />
        
        {/* Avatar Container with "Thick" Arcade Border */}
        <View className="rounded-[45px] border-[6px] border-white/10 p-1 shadow-2xl shadow-indigo-500/40">
          <View className="h-36 w-36 overflow-hidden rounded-[40px] bg-slate-800 border-2 border-white/20">
             <Image 
              source={{ uri: USER_IMAGE }} 
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
          {/* Level Badge - Floating */}
          <View className="absolute -bottom-1 -right-1 rotate-12 rounded-2xl bg-yellow-500 px-4 py-1.5 border-4 border-slate-950 shadow-lg">
             <Text className="text-sm font-main-black text-slate-950">LVL 24</Text>
          </View>
        </View>

        <Text className="mt-6 text-4xl font-main-black italic tracking-tighter text-white uppercase">
          STREET_RUNNER
        </Text>
      </View>

      {/* 2. RECENT AWARDS (Subway Surfers Badge Style) */}
      <View className="mb-6 px-6">
        <Text className="mb-3 text-[10px] font-main-bold uppercase tracking-[3px] text-slate-500">Recent Collection</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {recentAwards.map((award) => {
            const Icon = (LucideIcons as any)[award.icon];
            return (
              <View key={award.id} className="mr-3 h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border-2 border-white/5 shadow-md">
                <Icon size={24} color={award.color} strokeWidth={2.5} />
              </View>
            );
          })}
          <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border-2 border-dashed border-white/10">
            <LucideIcons.Plus size={20} color="#475569" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. STATS GRID */}
      <View className="flex-row flex-wrap justify-between px-6">
        {stats.map((stat, i) => {
           const Icon = (LucideIcons as any)[stat.icon];
           return (
            <View key={i} className="mb-4 w-[48%] rounded-[30px] border-b-[6px] border-black/50 bg-slate-900 p-5">
                <View className="flex-row items-center justify-between opacity-60">
                    <Icon size={16} color="#94a3b8" />
                    <LucideIcons.ChevronRight size={14} color="#94a3b8" />
                </View>
                <Text className="mt-3 text-[10px] font-main-bold uppercase tracking-widest text-slate-500">
                  {stat.label}
                </Text>
                <Text className={`text-2xl font-main-black italic ${stat.color}`}>
                  {stat.value}
                </Text>
            </View>
           );
        })}
      </View>

      {/* 4. ENERGY / XP BAR */}
      <View className="mx-6 mt-2 rounded-[35px] bg-slate-900 p-6 border-2 border-white/5 shadow-xl">
        <View className="flex-row justify-between items-end mb-3">
            <Text className="font-main-bold text-white uppercase text-xs tracking-[2px]">Season Progress</Text>
            <View className="rounded-full bg-indigo-500/20 px-2 py-1">
                <Text className="font-main-black text-[10px] text-indigo-400 italic">XP 850 / 1000</Text>
            </View>
        </View>
        <View className="h-8 w-full overflow-hidden rounded-2xl bg-slate-800 p-1.5 shadow-inner">
          <View 
            style={{ width: '75%' }}
            className="h-full rounded-xl bg-indigo-500 shadow-lg relative overflow-hidden"
          >
             {/* Glossy Reflection */}
             <View className="absolute top-0 h-[40%] w-full bg-white/25" /> 
          </View>
        </View>
      </View>

      {/* 5. ACTION BUTTONS */}
      <View className="p-6 gap-y-4">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="flex-row items-center justify-center rounded-[25px] bg-green-500 py-5 shadow-xl shadow-green-500/40"
        >
          {/* Top Gloss */}
          <View className="absolute top-0 h-1/2 w-full rounded-t-[25px] bg-white/20" />
          <LucideIcons.UserCircle size={22} color="white" />
          <Text className="ml-3 font-main-black uppercase text-white tracking-tighter text-lg">Edit Runner</Text>
        </TouchableOpacity>

      
      </View>

      <View className="h-20" /> {/* Bottom Spacer */}
    </ScrollView>
  );
}