import React, { useEffect, useMemo, useState } from "react";
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
  const earnedAwardIds = useSelector(selectEarnedAwards); // Use corrected selector

  const { level, xp, nextLevelXp } = usePlayerLevel();
  const { pickImage } = useGalleryPicker();

  // Map permanent IDs to actual achievement objects
  const myAwards = useMemo(() => {
    return earnedAwardIds
      .map((id) => ACHIEVEMENT_DATA.find((a) => a.id === id))
      .filter((a): a is any => !!a);
  }, [earnedAwardIds]);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  const USER = {
    xp: xp,
    nextLevelXp: nextLevelXp,
    total_quizzes: quizStats.totalQuizzes,
    wins: quizStats.totalWins,
    currentDailyStreak: quizStats.currentStreak,
    highestDailyStreak: quizStats.highestDailyStreak,
    accuracy: Math.round((quizStats.averageAccuracy || 0) * 100),
  };

  const winRate = Math.round(
    ((USER.wins || 0) / (USER.total_quizzes || 1)) * 100,
  );
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
      label: "AWARDS",
      value: myAwards.length,
      icon: "Star",
      color: "#facc15",
      bg: "#fef9c3",
    },
    {
      label: "WINS",
      value: USER.wins,
      icon: "Trophy",
      color: "#f97316",
      bg: "#fee2e2",
    },
    {
      label: "MATCHES",
      value: USER.total_quizzes,
      icon: "Gamepad",
      color: "#6366f1",
      bg: "#e0e7ff",
    },
    {
      label: "ACCURACY",
      value: `${USER.accuracy}%`,
      icon: "Target",
      color: "#22c55e",
      bg: "#d1fae5",
    },
    {
      label: "WIN RATE",
      value: `${winRate}%`,
      icon: "Zap",
      color: "#fbbf24",
      bg: "#fef3c7",
    },
    {
      label: "STREAK",
      value: USER.currentDailyStreak,
      icon: "Sun",
      color: "#f43f5e",
      bg: "#ffe4e6",
    },
    {
      label: "BEST STREAK",
      value: USER.highestDailyStreak,
      icon: "Flame",
      color: "#f43f5e",
      bg: "#ffe4e6",
    },
  ];

  return (
    <ScreenWrapper title="User Profile" variant="dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AvatarWithLevel
          imageUri={avatarUri || USER_IMAGE}
          level={level}
          onPress={changeAvatar}
        />
        <LevelProgressBar xp={USER.xp} nextLevelXp={USER.nextLevelXp} />

        <View className="mt-8 flex-row flex-wrap justify-between px-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </View>

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
