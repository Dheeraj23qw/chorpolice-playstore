import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, FlatList } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { Text } from "@/components/Text";
import ScreenWrapper from "@/components/screenwrapper";
import { useSelector } from "react-redux";
import { usePlayerLevel } from "@/service/usePlayerLevel";
import { RootState } from "@/redux/store";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import { selectEarnedAwards } from "@/features/awards/awardsSlice";
import { ACHIEVEMENT_DATA, Achievement } from "@/constants/achievements";
import AvatarWithLevel from "@/components/ProfileScreen/AvatarWithLevel";
import LevelProgressBar from "@/components/ProfileScreen/LevelProgressBar";
import StatCard from "@/components/ProfileScreen/StatCard";
import AchievementCard from "@/components/ProfileScreen/AchievementCard";
import { loadAvatar, saveAvatar } from "@/storage/userStorage";

const USER_IMAGE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop";

export default function UserProfile() {
  const quizStats = useSelector((state: RootState) => state.quizStats);
  const coins = useSelector((state: RootState) => state.wallet.coins);
  const earnedAwardIds = useSelector(selectEarnedAwards);

  const { level, xp, nextLevelXp } = usePlayerLevel();
  const { pickImage } = useGalleryPicker();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  /* ---------------- Avatar Load ---------------- */
  useEffect(() => {
    const saved = loadAvatar();
    if (saved) setAvatarUri(saved);
  }, []);

  const changeAvatar = async () => {
    const uri = await pickImage();
    if (uri) {
      setAvatarUri(uri);
      saveAvatar(uri);
    }
  };

  /* ---------------- Awards Mapping (SAFE + FAST) ---------------- */
  const myAwards = useMemo((): Achievement[] => {
    const idSet = new Set(earnedAwardIds);
    return ACHIEVEMENT_DATA.filter((a) => idSet.has(a.id));
  }, [earnedAwardIds]);

  /* ---------------- User Stats ---------------- */
  const USER = {
    xp,
    nextLevelXp,
    total_quizzes: quizStats.totalQuizzes || 0,
    wins: quizStats.totalWins || 0,
    accuracy: Math.round(quizStats.averageAccuracy || 0),
    // 🎯 Chor Police
    cpPlayed: quizStats.cpGamesPlayed || 0,
    cpWins: quizStats.cpGamesWon || 0,
  };

  const winRate =
    USER.total_quizzes === 0
      ? 0
      : Math.round((USER.wins / USER.total_quizzes) * 100);

  const cpWinRate =
    USER.cpPlayed === 0 ? 0 : Math.round((USER.cpWins / USER.cpPlayed) * 100);

  /* ---------------- Stat Cards ---------------- */
  const stats: {
    label: string;
    value: string | number;
    icon: keyof typeof LucideIcons;
    color: string;
    bg: string;
  }[] = [
    {
      label: "TOTAL COINS",
      value: coins,
      icon: "Coins",
      color: "#fbbf24",
      bg: "#fef3c7",
    },
    {
      label: "QUIZ WINS",
      value: USER.wins,
      icon: "Trophy",
      color: "#f97316",
      bg: "#fee2e2",
    },
    {
      label: "QUIZ MATCHES",
      value: USER.total_quizzes,
      icon: "Gamepad",
      color: "#6366f1",
      bg: "#e0e7ff",
    },

    {
      label: "CP MATCHES",
      value: USER.cpPlayed,
      icon: "Users",
      color: "#60a5fa",
      bg: "#dbeafe",
    },
    {
      label: "CP WINS",
      value: USER.cpWins,
      icon: "Shield",
      color: "#34d399",
      bg: "#d1fae5",
    },
  ];

  return (
    <ScreenWrapper title="User Profile" variant="dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar */}
        <AvatarWithLevel
          imageUri={avatarUri || USER_IMAGE}
          level={level}
          onPress={changeAvatar}
        />

        {/* Level Progress */}
        <LevelProgressBar xp={USER.xp} nextLevelXp={USER.nextLevelXp} />

        {/* Stats Grid */}
        <View className="mt-8 flex-row flex-wrap justify-between px-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </View>

        {/* Achievements */}
        <View className="mt-6 px-6">
          <Text className="mb-4 font-main-bold text-[12px] uppercase tracking-widest text-slate-400">
            Collection ({myAwards.length})
          </Text>

          {myAwards.length > 0 ? (
            <FlatList
              data={myAwards}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <AchievementCard achievement={item} />}
            />
          ) : (
            <View className="h-24 w-full items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/5">
              <Text className="font-main-bold text-[10px] uppercase text-slate-600">
                No medals won yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
