import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import * as LucideIcons from "lucide-react-native";
import { Text } from "@/components/Text";
import ScreenWrapper from "@/components/screenwrapper";
import { useSelector } from "react-redux";
import { usePlayerLevel } from "@/service/usePlayerLevel";
import { RootState } from "@/redux/store";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import { selectEarnedAwards } from "@/features/awards/awardsSlice";
import { Achievement, ACHIEVEMENT_DATA } from "@/constants/achievements";

const USER_IMAGE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop";

export default function UserProfile() {
  const quizStats = useSelector((state: RootState) => state.quizStats);
  const coins = useSelector((state: RootState) => state.wallet.coins);
  const earnedAwardIds = useSelector(selectEarnedAwards); // Use corrected selector

  const { level, xp, nextLevelXp } = usePlayerLevel();
  const { pickImage } = useGalleryPicker();

  // Map permanent IDs to actual achievement objects
  const myAwards = useMemo(() => {
    return earnedAwardIds
      .map((id) => ACHIEVEMENT_DATA.find((a) => a.id === id))
      .filter((a): a is any => !!a);
  }, [earnedAwardIds]);

const USER = {
    xp: xp,
    nextLevelXp: nextLevelXp,
    total_quizzes: quizStats.totalQuizzes,
    wins: quizStats.totalWins,
    currentDailyStreak: quizStats.currentStreak,
    highestDailyStreak: quizStats.highestDailyStreak,
    // Cleanly rounded accuracy
    accuracy: Math.round((quizStats.averageAccuracy || 0) * 100)
  };

  const levelProgress = (USER.xp / (USER.nextLevelXp || 1)) * 100;

  // Added (USER.wins || 0) to prevent any potential undefined issues
  const winRate = Math.round(
    ((USER.wins || 0) / (USER.total_quizzes || 1)) * 100,
  );

  const stats = [
    { label: "TOTAL COINS", value: coins, icon: "Coins", color: "#fbbf24", bg: "#fef3c7" },
    { label: "AWARDS", value: myAwards.length, icon: "Star", color: "#facc15", bg: "#fef9c3" },
    { label: "WINS", value: USER.wins, icon: "Trophy", color: "#f97316", bg: "#fee2e2" },
    { label: "MATCHES", value: USER.total_quizzes, icon: "Gamepad", color: "#6366f1", bg: "#e0e7ff" },
    { label: "ACCURACY", value: `${USER.accuracy}%`, icon: "Target", color: "#22c55e", bg: "#d1fae5" },
    { label: "WIN RATE", value: `${winRate}%`, icon: "Zap", color: "#fbbf24", bg: "#fef3c7" },
    { label: "STREAK", value: USER.currentDailyStreak, icon: "Sun", color: "#f43f5e", bg: "#ffe4e6" },
    { label: "BEST STREAK", value: USER.highestDailyStreak, icon: "Flame", color: "#f43f5e", bg: "#ffe4e6" },
  ];

  return (
    <ScreenWrapper title="User Profile" variant="dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar Section */}
        <View className="mt-8 w-full items-center">
          <View className="relative">
            <View className="rounded-[50px] border-[6px] border-slate-900 shadow-2xl">
              <View className="rounded-[44px] border-2 border-white/20 p-1 bg-slate-800">
                <TouchableOpacity
                  onPress={pickImage}
                  className="h-40 w-40 overflow-hidden rounded-[40px]"
                >
                  <Image
                    source={{ uri: USER_IMAGE }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Level Badge Overlay */}
            <View className="absolute -bottom-2 -right-2 bg-yellow-500 px-3 py-1 rounded-xl border-4 border-slate-900 shadow-lg rotate-3">
              <Text className="text-xs font-main-bold text-slate-900">
                LVL {level}
              </Text>
            </View>
          </View>
        </View>

        {/* Level XP Bar */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-[10px] font-main-bold text-slate-400 uppercase tracking-widest">
              Season Progress
            </Text>
            <Text className="text-[10px] font-main-bold text-indigo-400">
              {USER.xp} / {USER.nextLevelXp} XP
            </Text>
          </View>
          <View className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <View
              style={{ width: `${levelProgress}%` }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </View>
        </View>

        {/* Stats Section - Glassy Cards */}
        <View className="flex-row flex-wrap justify-between px-6 mt-8">
          {stats.map((stat, i) => {
            const Icon =
              (LucideIcons as any)[stat.icon] || LucideIcons.Activity;
            return (
              <View
                key={i}
                className="mb-4 w-[48%] rounded-[28px] bg-indigo-900/30 border border-white/10 p-5 shadow-md flex-row items-center backdrop-blur-sm"
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon size={24} color={stat.color} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[9px] font-main-bold uppercase text-slate-400">
                    {stat.label}
                  </Text>
                  <Text className="text-lg font-main-bold text-white mt-0.5">
                    {stat.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Winning Awards Section */}
        <View className="mt-6 px-6">
          <Text className="text-[12px] font-main-bold uppercase tracking-widest text-slate-400 mb-4">
            Collection ({myAwards.length})
          </Text>

          {myAwards.length > 0 ? (
            <FlatList
              data={myAwards}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }: { item: Achievement }) => {
                const Icon =
                  (LucideIcons as any)[item.iconName] || LucideIcons.Award;

                // 1. Explicitly type the object keys using the Achievement rarity union
                const rarityColors: Record<Achievement["rarity"], string> = {
                  Legendary: "#fbbf24",
                  Epic: "#a78bfa",
                  Rare: "#60a5fa",
                  Common: "#94a3b8",
                };

                // 2. Now indexing is safe because TypeScript knows item.rarity is a valid key
                const rarityColor = rarityColors[item.rarity];

                return (
                  <View className="mr-4 items-center">
                    <View className="h-20 w-20 items-center justify-center rounded-2xl bg-indigo-900/30 border border-white/20 shadow-md backdrop-blur-sm">
                      <View className="h-14 w-14 items-center justify-center rounded-full bg-white/5">
                        <Icon size={28} color={rarityColor} strokeWidth={2.5} />
                      </View>
                    </View>
                    <Text className="text-[8px] font-main-bold text-slate-500 mt-2 uppercase text-center w-20">
                      {item.title}
                    </Text>
                  </View>
                );
              }}
            />
          ) : (
            <View className="h-24 w-full rounded-3xl border-2 border-dashed border-white/5 items-center justify-center bg-white/5">
              <Text className="text-slate-600 font-main-bold text-[10px] uppercase">
                No medals won yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
