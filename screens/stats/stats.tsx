import React from "react";
import { ScrollView, View } from "react-native";
import ScreenWrapper from "@/components/screenwrapper";
import PlayerCard from "@/components/stats/PlayerCard";
import StatCard from "@/components/stats/StatCard";
import Section from "@/components/stats/Section";
import Row from "@/components/stats/Row";
import {
  Gamepad2,
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Star,
  Activity,
} from "lucide-react-native";

export default function StatsScreen() {
  const USER_STATS = {
    username: "PlayerOne",
    level: 12,
    xp: 3480,
    nextLevelXp: 4000,
    matches: 284,
    quizzes: 96,
    wins: 172,
    losses: 112,
    currentStreak: 6,
    highestStreak: 21,
    easyWins: 40,
    mediumWins: 25,
    hardWins: 10,
    easyPlayed: 60,
    mediumPlayed: 45,
    hardPlayed: 20,
  };

  const winRate = Math.round((USER_STATS.wins / USER_STATS.matches) * 100);
  const levelProgress = (USER_STATS.xp / USER_STATS.nextLevelXp) * 100;

  return (
    <ScreenWrapper
      title="Statistics"
      variant="dark"
      subtitle="Performance Analytics"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-12 px-5 bg-slate-950"
      >
        {/* Player Info */}
        <PlayerCard user={USER_STATS} progress={levelProgress} />

        {/* ================= Quick Stats Section ================= */}
        <Section title="Quick Stats">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 5 }}>
            <View className="flex-row space-x-4">
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
          </ScrollView>
        </Section>

        {/* ================= Played by Difficulty Section ================= */}
        <Section title="Played by Difficulty">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 5 }}>
            <View className="flex-row space-x-4">
              <StatCard
                label="Easy Played"
                value={USER_STATS.easyPlayed}
                icon={<Activity size={20} color="#34d399" />}
              />
              <StatCard
                label="Medium Played"
                value={USER_STATS.mediumPlayed}
                icon={<Activity size={20} color="#fbbf24" />}
              />
              <StatCard
                label="Hard Played"
                value={USER_STATS.hardPlayed}
                icon={<Activity size={20} color="#f87171" />}
              />
            </View>
          </ScrollView>
        </Section>

        {/* ================= Elite Streaks Section ================= */}
        <Section title="Elite Streaks">
          <Row
            label="Current Win Streak"
            value={USER_STATS.currentStreak}
            icon={<Flame size={18} color="#f97316" />}
          />
          <Row
            label="All-Time Highest"
            value={USER_STATS.highestStreak}
            icon={<Star size={18} color="#facc15" />}
          />
        </Section>

        {/* ================= Quiz Wins by Difficulty Section ================= */}
        <Section title="Quiz Wins by Difficulty">
          <Row
            label="Easy Mode Wins"
            value={USER_STATS.easyWins}
            icon={<Activity size={18} color="#34d399" />}
          />
          <Row
            label="Medium Mode Wins"
            value={USER_STATS.mediumWins}
            icon={<Activity size={18} color="#fbbf24" />}
          />
          <Row
            label="Hard Mode Wins"
            value={USER_STATS.hardWins}
            icon={<Activity size={18} color="#f87171" />}
          />
        </Section>
      </ScrollView>
    </ScreenWrapper>
  );
}
