import React from "react";
import { View,  ScrollView, useWindowDimensions } from "react-native";
import {
  Trophy,
  Lock,
  Zap,
  Target,
  Star,
  Shield,
  Coins,
  Swords,
   UserPlus, Share2, Flame, Gift
} from "lucide-react-native";

import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

type AwardStatus = "unlocked" | "progress" | "locked";
type AwardRarity = "Legendary" | "Epic" | "Rare" | "Common";

type Achievement = {
  id: number;
  title: string;
  desc: string;
  progress: number;
  status: AwardStatus;
  rarity: AwardRarity;
  icon: React.ReactNode;
};

const ICON_SIZE = 26;

/* ---------------- Career Achievements ---------------- */

const careerAchievements: Achievement[] = [
  {
    id: 1,
    title: "Apex Predator",
    desc: "Eliminate 50 enemies in one round",
    progress: 100,
    status: "unlocked",
    rarity: "Legendary",
    icon: <Zap size={ICON_SIZE} color="#eab308" />,
  },
  {
    id: 2,
    title: "Silent Ghost",
    desc: "Complete 'Sector 7' without detection",
    progress: 75,
    status: "progress",
    rarity: "Epic",
    icon: <Shield size={ICON_SIZE} color="#8b5cf6" />,
  },
  {
    id: 3,
    title: "Master Architect",
    desc: "Build a base with 500+ structures",
    progress: 0,
    status: "locked",
    rarity: "Rare",
    icon: <Target size={ICON_SIZE} color="#3b82f6" />,
  },
];

/* ---------------- Daily & Streak Challenges ---------------- */

const dailyChallenges: Achievement[] = [
  {
    id: 101,
    title: "Win Streak",
    desc: "Win 3 matches in a row",
    progress: 66,
    status: "progress",
    rarity: "Common",
    icon: <Flame size={ICON_SIZE} color="#f97316" />,
  },
  {
    id: 102,
    title: "Coin Hunter",
    desc: "Collect 500 coins today",
    progress: 40,
    status: "progress",
    rarity: "Common",
    icon: <Coins size={ICON_SIZE} color="#facc15" />,
  },
  {
    id: 103,
    title: "Match Grinder",
    desc: "Play 5 matches today",
    progress: 100,
    status: "unlocked",
    rarity: "Common",
    icon: <Swords size={ICON_SIZE} color="#6366f1" />,
  },
  {
    id: 104,
    title: "Perfect Run",
    desc: "Win without losing a round",
    progress: 0,
    status: "locked",
    rarity: "Rare",
    icon: <Star size={ICON_SIZE} color="#eab308" />,
  },
];

/* ---------------- Engagement Boost Awards ---------------- */

const engagementAwards: Achievement[] = [
  {
    id: 401,
    title: "Invite a Friend",
    desc: "Invite your first friend to the game",
    progress: 100,
    status: "unlocked",
    rarity: "Common",
    icon: <UserPlus size={ICON_SIZE} color="#22c55e" />,
  },
  {
    id: 402,
    title: "Share the Game",
    desc: "Share the game with 5 friends",
    progress: 40,
    status: "progress",
    rarity: "Rare",
    icon: <Share2 size={ICON_SIZE} color="#3b82f6" />,
  },
  {
    id: 403,
    title: "7-Day Streak",
    desc: "Play the game 7 days in a row",
    progress: 70,
    status: "progress",
    rarity: "Epic",
    icon: <Flame size={ICON_SIZE} color="#f97316" />,
  },
  {
    id: 404,
    title: "Mystery Reward",
    desc: "Unlock a surprise reward",
    progress: 0,
    status: "locked",
    rarity: "Legendary",
    icon: <Gift size={ICON_SIZE} color="#e879f9" />,
  },
];


export default function AwardsScreen() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.78, 320);

  const renderRow = (title: string, subtitle: string, data: Achievement[]) => (
    <View className="mb-8">
      {/* Section Header */}
      <View className="mb-3 flex-row items-end justify-between px-1">
        <View>
          <Text className="text-base font-main-bold text-slate-900">
            {title}
          </Text>
          <Text className="text-xs font-main-md text-slate-500">
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {data.map((award) => {
          const isLocked = award.status === "locked";
          const isUnlocked = award.status === "unlocked";

          return (
            <View
              key={award.id}
              style={{ width: CARD_WIDTH }}
              className="mr-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {/* Header */}
              <View className="mb-3 flex-row items-center justify-between">
                <View
                  className={`rounded-full px-3 py-1 ${
                    award.rarity === "Legendary"
                      ? "bg-amber-100"
                      : "bg-slate-100"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-main-bold uppercase ${
                      award.rarity === "Legendary"
                        ? "text-amber-700"
                        : "text-slate-600"
                    }`}
                  >
                    {award.rarity}
                  </Text>
                </View>

                {isLocked && <Lock size={16} color="#94a3b8" />}
              </View>

              {/* Icon */}
              <View
                className={`mb-4 h-14 w-14 items-center justify-center rounded-2xl ${
                  isUnlocked ? "bg-amber-100" : "bg-slate-100"
                }`}
              >
                {!isLocked ? award.icon : (
                  <Lock size={22} color="#94a3b8" />
                )}
              </View>

              {/* Title */}
              <Text
                numberOfLines={1}
                className="text-sm font-main-bold uppercase text-slate-900"
              >
                {isLocked ? "Locked Achievement" : award.title}
              </Text>

              {/* Description */}
              <Text
                numberOfLines={3}
                className="mt-1 text-xs leading-4 font-main-md text-slate-500"
              >
                {isLocked
                  ? "Keep playing to unlock this achievement."
                  : award.desc}
              </Text>

              {/* Progress */}
              <View className="mt-4">
                <div className="mb-1 flex-row justify-between">
                  <Text className="text-[10px] font-main-bold uppercase text-slate-400">
                    Progress
                  </Text>
                  <Text className="text-[10px] font-main-bold text-slate-400">
                    {award.progress}%
                  </Text>
                </div>

                <View className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <View
                    style={{ width: `${award.progress}%` }}
                    className={`h-full ${
                      isUnlocked
                        ? "bg-amber-400"
                        : "bg-indigo-500"
                    }`}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ScreenWrapper title="Awards" subtitle="Progress & Challenges">
      {renderRow(
        "Career Milestones",
        "Permanent achievements",
        careerAchievements
      )}

      {renderRow(
        "Daily Challenges",
        "Refresh every 24 hours",
        dailyChallenges
      )}

      {renderRow(
        "Engagement Boost",
        "Invite, share & build daily habits",
        engagementAwards
      )}
    </ScreenWrapper>
  );
}
