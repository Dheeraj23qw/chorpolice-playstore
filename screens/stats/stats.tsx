import React from "react";
import { View, Text } from "react-native";
import {
  Trophy,
  Flame,
  Gamepad2,
  Target,
  Star,
  TrendingUp,
} from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";

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
  const winRate = Math.round(
    (USER_STATS.wins / USER_STATS.matches) * 100
  );

  const levelProgress =
    (USER_STATS.xp / USER_STATS.nextLevelXp) * 100;

  return (
    <ScreenWrapper
      title="Your Stats"
      subtitle="Track Your Performance"
    >
      {/* 🧑 Player Card */}
      <View className="mb-6 rounded-3xl bg-indigo-600 p-6 shadow-xl">
        <Text className="text-xs uppercase tracking-widest text-indigo-200">
          Player
        </Text>

        <Text className="mt-1 text-2xl font-black text-white">
          {USER_STATS.username}
        </Text>

        {/* Level Progress */}
        <View className="mt-4">
          <View className="mb-1 flex-row justify-between">
            <Text className="text-xs text-indigo-200">
              Level {USER_STATS.level}
            </Text>
            <Text className="text-xs text-indigo-200">
              {USER_STATS.xp}/{USER_STATS.nextLevelXp} XP
            </Text>
          </View>

          <View className="h-2 overflow-hidden rounded-full bg-white/20">
            <View
              style={{ width: `${levelProgress}%` }}
              className="h-full rounded-full bg-white"
            />
          </View>
        </View>
      </View>

      {/* 📈 Quick Stats Grid */}
      <View className="mb-6 flex-row flex-wrap justify-between gap-y-4">
        <StatCard
          label="Matches"
          value={USER_STATS.matches}
          icon={<Gamepad2 size={22} color="#6366f1" />}
        />
        <StatCard
          label="Wins"
          value={USER_STATS.wins}
          icon={<Trophy size={22} color="#10b981" />}
        />
        <StatCard
          label="Losses"
          value={USER_STATS.losses}
          icon={<Target size={22} color="#ef4444" />}
        />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          icon={<TrendingUp size={22} color="#6366f1" />}
        />
      </View>

      {/* 🔥 Streaks */}
      <Section title="Streaks">
        <Row label="Current Streak" value={`${USER_STATS.currentStreak} wins`} icon={<Flame size={18} color="#f97316" />} />
        <Row label="Highest Streak" value={`${USER_STATS.highestStreak} wins`} icon={<Star size={18} color="#facc15" />} />
      </Section>

      {/* 🎯 Game Activity */}
      <Section title="Game Activity">
        <Row label="Chor Police Games" value={USER_STATS.chorPolice} />
        <Row label="Quizzes Played" value={USER_STATS.quizzes} />
      </Section>

      {/* 🚀 Motivation */}
      <View className="mt-6 rounded-2xl bg-emerald-50 p-5 border border-emerald-200">
        <Text className="font-bold text-emerald-800">
          🎯 Keep Playing!
        </Text>
        <Text className="mt-1 text-sm text-emerald-700">
          Win 4 more matches to beat your highest streak record!
        </Text>
      </View>

      <View className="h-12" />
    </ScreenWrapper>
  );
}

/* ---------- Components ---------- */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <View className="w-[48%] rounded-2xl bg-white p-4 shadow-md border border-slate-100">
      <View className="mb-2 flex-row items-center justify-between">
        {icon}
      </View>
      <Text className="text-xl font-black text-slate-900">
        {value}
      </Text>
      <Text className="mt-1 text-xs text-slate-400">
        {label}
      </Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-black text-slate-900">
        {title}
      </Text>
      <View className="gap-y-3">{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-slate-100">
      <View className="flex-row items-center gap-x-2">
        {icon}
        <Text className="font-medium text-slate-700">
          {label}
        </Text>
      </View>
      <Text className="font-bold text-slate-900">
        {value}
      </Text>
    </View>
  );
}
