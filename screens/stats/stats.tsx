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
  Activity,
  Star,
} from "lucide-react-native";
import { useSelector } from "react-redux";
import { usePlayerLevel } from "@/service/usePlayerLevel";
import { selectUserQuizStats } from "@/features/gameStats/gameStatsSelector";
import { loadUsername } from "@/storage/userStorage";

export default function StatsScreen() {
  const username = loadUsername();

  const { level, xp, nextLevelXp } = usePlayerLevel();
  const USER_STATS = useSelector(selectUserQuizStats);

  // 📊 derived stats
  const winRate =
    USER_STATS.total_quizzes === 0
      ? 0
      : Math.round((USER_STATS.wins / USER_STATS.total_quizzes) * 100);

  const levelProgress = nextLevelXp === 0 ? 0 : (xp / nextLevelXp) * 100;

  const accuracy = USER_STATS.averageAccuracy || 0;

  const playerData = {
    username,
    level,
    xp,
    nextLevelXp,
  };
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
        {/* ================= Player Card ================= */}
        <PlayerCard user={playerData} progress={levelProgress} />

        {/* ================= Quick Stats ================= */}
        <Section title="Quick Stats">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-4">
              <StatCard
                label="Matches"
                value={USER_STATS.total_quizzes}
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

        {/* ================= Accuracy ================= */}
        <Section title="Performance">
          <StatCard
            label="Average Accuracy"
            value={`${accuracy}%`}
            icon={<Star size={20} color="#fbbf24" />}
          />
        </Section>

        {/* ================= Difficulty Played ================= */}
        <Section title="Played by Difficulty">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-4">
              <StatCard
                label="Easy"
                value={USER_STATS.easyPlayed}
                icon={<Activity size={20} color="#34d399" />}
              />
              <StatCard
                label="Medium"
                value={USER_STATS.mediumPlayed}
                icon={<Activity size={20} color="#fbbf24" />}
              />
              <StatCard
                label="Hard"
                value={USER_STATS.hardPlayed}
                icon={<Activity size={20} color="#f87171" />}
              />
            </View>
          </ScrollView>
        </Section>

        {/* ================= Chor Police Stats ================= */}
        <Section title="Chor Police Stats">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 5 }}
          >
            <View className="flex-row space-x-4">
              <StatCard
                label="Played"
                value={USER_STATS.cpPlayed}
                icon={<Gamepad2 size={20} color="#60a5fa" />}
              />
              <StatCard
                label="Wins"
                value={USER_STATS.cpWins}
                icon={<Trophy size={20} color="#10b981" />}
              />
              <StatCard
                label="Losses"
                value={USER_STATS.cpLosses}
                icon={<Target size={20} color="#f43f5e" />}
              />
            </View>
          </ScrollView>
        </Section>

        {/* ================= Wins by Difficulty ================= */}
        <Section title="Wins by Difficulty">
          <Row
            label="Easy Wins"
            value={USER_STATS.easyWins}
            icon={<Activity size={18} color="#34d399" />}
          />
          <Row
            label="Medium Wins"
            value={USER_STATS.mediumWins}
            icon={<Activity size={18} color="#fbbf24" />}
          />
          <Row
            label="Hard Wins"
            value={USER_STATS.hardWins}
            icon={<Activity size={18} color="#f87171" />}
          />
        </Section>

        {/* ================= Losses by Difficulty ================= */}
        <Section title="Losses by Difficulty">
          <Row
            label="Easy Losses"
            value={USER_STATS.easyLosses}
            icon={<Target size={18} color="#34d399" />}
          />
          <Row
            label="Medium Losses"
            value={USER_STATS.mediumLosses}
            icon={<Target size={18} color="#fbbf24" />}
          />
          <Row
            label="Hard Losses"
            value={USER_STATS.hardLosses}
            icon={<Target size={18} color="#f87171" />}
          />
        </Section>
      </ScrollView>
    </ScreenWrapper>
  );
}
