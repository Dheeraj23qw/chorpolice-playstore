import React from "react";
import { View, ScrollView } from "react-native";
import {
  Trophy,
  Flame,
  Gamepad2,
  Target,
  Star,
  TrendingUp,
  ChevronRight,
  Activity,
  Zap
} from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

const USER_STATS = {
  username: "PlayerOne",
  level: 12,
  xp: 3480,
  nextLevelXp: 4000,
  matches: 284,
  quizzes: 96,
  chorPolice: 188,
  wins: 172,
  losses: 112,
  currentStreak: 6,
  highestStreak: 21,
};

export default function StatsScreen() {
  const winRate = Math.round((USER_STATS.wins / USER_STATS.matches) * 100);
  const levelProgress = (USER_STATS.xp / USER_STATS.nextLevelXp) * 100;

  return (
    <ScreenWrapper title="Statistics" variant="dark" subtitle="Performance Analytics">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-12 px-5 bg-slate-950">
        
        {/* ================= 🧑 High-End Player Card ================= */}
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
                {USER_STATS.username}
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20 border border-white/30">
               <Text className="text-xl font-main-bold text-white">{USER_STATS.level}</Text>
            </View>
          </View>

          {/* Level Progress */}
          <View className="mt-8">
            <View className="mb-2 flex-row justify-between items-end">
              <Text className="text-[10px] text-indigo-100 font-main-bold uppercase tracking-wider">
                Experience Points
              </Text>
              <Text className="text-xs text-white font-main-bold">
                {USER_STATS.xp.toLocaleString()} <Text className="text-indigo-200">/ {USER_STATS.nextLevelXp.toLocaleString()} XP</Text>
              </Text>
            </View>

            <View className="h-3 overflow-hidden rounded-full bg-black/20">
              <View
                style={{ width: `${levelProgress}%` }}
                className="h-full rounded-full bg-white shadow-sm shadow-white"
              />
            </View>
          </View>
        </View>

        {/* ================= 📈 Quick Stats Grid ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          <StatCard
            label="Matches"
            value={USER_STATS.matches}
            icon={<Gamepad2 size={20} color="#818cf8" />}
          />
          <StatCard
            label="Wins"
            value={USER_STATS.wins}
            icon={<Trophy size={20} color="#10b981" />}
          />
          <StatCard
            label="Losses"
            value={USER_STATS.losses}
            icon={<Target size={20} color="#f43f5e" />}
          />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            icon={<TrendingUp size={20} color="#6366f1" />}
          />
        </View>

        {/* ================= 🔥 Streaks & Activity ================= */}
        <View className="mt-8">
            <Section title="Elite Streaks">
            <Row
                label="Current Win Streak"
                value={`${USER_STATS.currentStreak}`}
                icon={<Flame size={18} color="#f97316" />}
            />
            <Row
                label="All-Time Highest"
                value={`${USER_STATS.highestStreak}`}
                icon={<Star size={18} color="#facc15" />}
            />
            </Section>

            <Section title="Game Activity">
            <Row label="Chor Police" value={USER_STATS.chorPolice} icon={<Activity size={18} color="#94a3b8" />} />
            <Row label="Quizzes" value={USER_STATS.quizzes} icon={<Activity size={18} color="#94a3b8" />} />
            </Section>
        </View>

        {/* ================= 🚀 Motivation Card ================= */}
        <View className="mt-4 rounded-[32px] bg-emerald-500/10 p-6 border border-emerald-500/20">
          <View className="flex-row items-center space-x-3 mb-2">
             <Trophy size={20} color="#10b981" />
             <Text className="font-main-bold text-emerald-400 text-lg">Goal Within Reach!</Text>
          </View>
          <Text className="text-sm text-emerald-100/70 font-main-md leading-5">
            You're just <Text className="text-emerald-400 font-main-bold">4 more wins</Text> away from shattering your personal best streak. Keep up the momentum!
          </Text>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

/* ---------- Premium Sub-Components ---------- */

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <View className="w-[48%] rounded-[32px] bg-slate-900 p-6 border border-slate-800">
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="mb-4 px-1 text-[12px] font-main-bold uppercase tracking-[2px] text-slate-500">{title}</Text>
      <View className="space-y-3">{children}</View>
    </View>
  );
}

function Row({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between rounded-[24px] bg-slate-900 px-5 py-4 border border-slate-800">
      <View className="flex-row items-center space-x-4">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
            {icon}
        </View>
        <Text className="font-main-md text-slate-300">{label}</Text>
      </View>
      <View className="flex-row items-center space-x-2">
         <Text className="font-main-bold text-white text-lg">{value}</Text>
         <ChevronRight size={14} color="#475569" />
      </View>
    </View>
  );
}