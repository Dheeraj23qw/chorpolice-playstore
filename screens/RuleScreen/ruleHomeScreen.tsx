import React from "react";
import { View, ScrollView } from "react-native";
import { BookOpen, Info, ShieldCheck } from "lucide-react-native";

import { rulesGroups } from "@/constants/gameRules";
import { RuleGroupCard } from "@/components/RuleScreen_components/RuleGroupCard";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import ScreenWrapper from "@/components/screenwrapper";

export default function RulesHome() {
  return (
    <ScreenWrapper 
      title="How to Play" 
      variant="dark" 
      subtitle="rules for a fair game"
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pb-12 pt-4 bg-slate-950"
      >
        {/* ================= ✨ Glassy Header Card ================= */}
        <View className="relative overflow-hidden mb-10 rounded-[40px] bg-white/[0.03] border border-white/10 p-8 shadow-2xl">
          {/* Ambient Background Glows (The "Metamorphism" feel) */}
          <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
          <View className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 border border-indigo-500/30 mb-5 shadow-inner">
              <ShieldCheck size={32} color="#818cf8" strokeWidth={1.5} />
            </View>
            
            <Text className="text-slate-500 text-[10px] font-main-bold tracking-[3px] text-center uppercase mb-2">
              The Basics
            </Text>
            
            <Text 
              style={{ fontSize: rf(3) }}
              className="text-white font-main-bold text-center tracking-tight"
            >
              Play Fair. Have Fun.
            </Text>
            
            <Text className="text-slate-400 text-xs font-main-md text-center mt-3 leading-5">
              Follow these simple guidelines to make sure everyone has a great time in the arena.
            </Text>
          </View>
        </View>

        {/* ================= 📜 Simple Rules List ================= */}
        <View className="space-y-4">
          <View className="flex-row items-center mb-2 px-1">
             <View className="h-[1px] flex-1 bg-white/5" />
             <Text className="mx-4 text-[10px] font-main-bold text-slate-600 uppercase tracking-widest">
                Rule Book
             </Text>
             <View className="h-[1px] flex-1 bg-white/5" />
          </View>

          {rulesGroups.map((group, index) => (
            <View key={group.id} className="relative">
              {/* Subtle glass effect behind cards */}
              <View className="absolute inset-0 bg-white/[0.01] rounded-3xl blur-md" />
              <RuleGroupCard 
                group={group} 
                index={index} 
              />
            </View>
          ))}
        </View>

        {/* ================= 💡 Quick Tip ================= */}
        <View className="mt-10 flex-row items-center bg-indigo-500/5 p-5 rounded-[30px] border border-indigo-500/10">
            <Info size={20} color="#6366f1" />
            <Text className="ml-4 flex-1 text-slate-500 text-[11px] font-main-md">
                Need more help? You can always contact our support team through the main menu.
            </Text>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}