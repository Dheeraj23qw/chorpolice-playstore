import React from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import {
  Trophy,
  Lock,
  Zap,
  Target,
  Star,
  Shield,
  Coins,
  Swords,
  UserPlus,
  Share2,
  Flame,
  Gift,
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

/* ---------------- Data Mockups ---------------- */
const careerAchievements: Achievement[] = [
  { id: 1, title: "Apex Predator", desc: "Eliminate 50 enemies in one round", progress: 100, status: "unlocked", rarity: "Legendary", icon: <Zap size={ICON_SIZE} color="#fbbf24" /> },
  { id: 2, title: "Silent Ghost", desc: "Complete 'Sector 7' without detection", progress: 75, status: "progress", rarity: "Epic", icon: <Shield size={ICON_SIZE} color="#a78bfa" /> },
  { id: 3, title: "Master Architect", desc: "Build a base with 500+ structures", progress: 0, status: "locked", rarity: "Rare", icon: <Target size={ICON_SIZE} color="#60a5fa" /> },
];

const dailyChallenges: Achievement[] = [
  { id: 101, title: "Win Streak", desc: "Win 3 matches in a row", progress: 66, status: "progress", rarity: "Common", icon: <Flame size={ICON_SIZE} color="#fb923c" /> },
  { id: 102, title: "Coin Hunter", desc: "Collect 500 coins today", progress: 40, status: "progress", rarity: "Common", icon: <Coins size={ICON_SIZE} color="#fde047" /> },
  { id: 103, title: "Match Grinder", desc: "Play 5 matches today", progress: 100, status: "unlocked", rarity: "Common", icon: <Swords size={ICON_SIZE} color="#818cf8" /> },
];

export default function AwardsScreen() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.78, 300);

  const getRarityStyles = (rarity: AwardRarity) => {
    switch (rarity) {
      case "Legendary": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Epic": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Rare": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const renderRow = (title: string, subtitle: string, data: Achievement[]) => (
    <View className="mb-10">
      <View className="mb-4 flex-row items-end justify-between px-5">
        <View>
          <Text className="text-xl font-main-bold text-white tracking-tight">{title}</Text>
          <Text className="text-xs font-main-md text-slate-500 tracking-wide uppercase mt-1">{subtitle}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-5"
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {data.map((award) => {
          const isLocked = award.status === "locked";
          const isUnlocked = award.status === "unlocked";
          const rarityStyles = getRarityStyles(award.rarity);

          return (
            <View
              key={award.id}
              style={{ width: CARD_WIDTH }}
              className={`mr-4 rounded-[40px] border p-6 ${
                isUnlocked ? "bg-slate-900 border-indigo-500/20" : "bg-slate-900/50 border-white/5"
              }`}
            >
              {/* Badge & Lock */}
              <View className="mb-6 flex-row items-center justify-between">
                <View className={`rounded-full border px-3 py-1 ${rarityStyles}`}>
                  <Text className="text-[9px] font-main-bold uppercase tracking-[1px]">{award.rarity}</Text>
                </View>
                {isLocked && <Lock size={14} color="#475569" />}
              </View>

              {/* Icon Glow Container */}
              <View className="relative mb-6 h-16 w-16 items-center justify-center">
                {isUnlocked && <View className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-xl" />}
                <View className={`h-16 w-16 items-center justify-center rounded-3xl border ${
                  isUnlocked ? "bg-slate-800 border-indigo-500/40 shadow-2xl" : "bg-slate-900 border-white/5"
                }`}>
                  {!isLocked ? award.icon : <Lock size={24} color="#1e293b" />}
                </View>
              </View>

              {/* Title & Description */}
              <Text numberOfLines={1} className={`text-base font-main-bold uppercase tracking-tighter ${isLocked ? "text-slate-600" : "text-white"}`}>
                {isLocked ? "Secret Award" : award.title}
              </Text>

              <Text numberOfLines={2} className="mt-2 text-xs leading-5 font-main-md text-slate-500">
                {isLocked ? "Complete hidden objectives to reveal." : award.desc}
              </Text>

              {/* Progress Bar Section */}
              <View className="mt-8">
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-[10px] font-main-bold uppercase tracking-widest text-slate-600">Sync Status</Text>
                  <Text className="text-[10px] font-main-bold text-indigo-400">{award.progress}%</Text>
                </View>

                <View className="h-2 w-full overflow-hidden rounded-full bg-black/40">
                  <View
                    style={{ width: `${award.progress}%` }}
                    className={`h-full rounded-full ${isUnlocked ? "bg-amber-400" : "bg-indigo-500 shadow-sm shadow-indigo-500"}`}
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
    <ScreenWrapper title="Trophy Room" variant="dark" subtitle="Elite Achievements">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 pt-4 bg-slate-950">
        {renderRow("Career Milestones", "Path to Legend", careerAchievements)}
        {renderRow("Daily Operations", "Resets in 14h 22m", dailyChallenges)}
        
        {/* Premium Banner */}
        <View className="mx-5 mt-4 rounded-[32px] bg-indigo-600 p-6 flex-row items-center justify-between overflow-hidden shadow-2xl shadow-indigo-500/30">
             <View className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full" />
             <View className="flex-1 pr-4">
                <Text className="text-white font-main-bold text-lg">Pro Rewards</Text>
                <Text className="text-indigo-100/70 text-xs font-main-md mt-1">Unlock exclusive Legendary awards by reaching Level 20.</Text>
             </View>
             <Trophy size={32} color="white" strokeWidth={2.5} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}