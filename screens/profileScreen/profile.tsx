import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { Coins, Trophy, Users, Target, ShieldCheck, Zap, Network, Medal, Lock } from "lucide-react-native";
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
import { loadAvatar, saveAvatar, loadUsername, loadAvatarId } from "@/storage/userStorage";
import { loadReferralStats } from "@/storage/referralStatsStorage";
import { BlurView } from "expo-blur";
import { rf } from "@/utils/responsive";

export default function UserProfile() {
  const quizStats = useSelector((state: RootState) => state.quizStats);
  const coins = useSelector((state: RootState) => state.wallet.coins);
  const earnedAwardIds = useSelector(selectEarnedAwards);

  const { level, xp, nextLevelXp } = usePlayerLevel();
  const { pickImage } = useGalleryPicker();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState(loadAvatarId());
  const [username, setUsername] = useState(loadUsername());
  const referralStats = loadReferralStats();

  useEffect(() => {
    const saved = loadAvatar();
    if (saved) setAvatarUri(saved);
    const savedName = loadUsername();
    if (savedName) setUsername(savedName);
    setAvatarId(loadAvatarId());
  }, []);

  const changeAvatar = async () => {
    const uri = await pickImage();
    if (uri) {
      setAvatarUri(uri);
      saveAvatar(uri);
    }
  };

  const myAwards = useMemo((): Achievement[] => {
    const idSet = new Set(earnedAwardIds);
    return ACHIEVEMENT_DATA.filter((a) => idSet.has(a.id));
  }, [earnedAwardIds]);

  const statsList: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    bg: string;
  }[] = [
    {
      label: "WALLET",
      value: coins,
      icon: Coins,
      color: "#fbbf24",
      bg: "rgba(251, 191, 36, 0.1)",
    },
    {
      label: "TOTAL WINS",
      value: (quizStats.totalWins || 0) + (quizStats.cpGamesWon || 0),
      icon: Trophy,
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.1)",
    },
    {
      label: "NETWORK",
      value: referralStats.totalShares,
      icon: Users,
      color: "#818cf8",
      bg: "rgba(129, 140, 248, 0.1)",
    },
    {
      label: "ACCURACY",
      value: `${Math.round(quizStats.averageAccuracy || 0)}%`,
      icon: Target,
      color: "#34d399",
      bg: "rgba(52, 211, 153, 0.1)",
    },
  ];

  return (
    <ScreenWrapper title="Personal Profile" variant="dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Header Hero Section */}
        <View className="items-center pb-4">
          <AvatarWithLevel
            imageUri={avatarUri}
            avatarId={avatarId}
            level={level}
            onPress={changeAvatar}
          />

          <View className="mt-8 items-center">
            <Text
              style={{ fontSize: rf(3.5) }}
              className="font-main-bold uppercase tracking-tighter text-white"
            >
              {username}
            </Text>
            <View className="mt-2 flex-row items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <ShieldCheck size={14} color="#818cf8" />
              <Text className="ml-2 font-main-bold text-[10px] uppercase tracking-widest text-indigo-300">
                Verified Citizen
              </Text>
            </View>
          </View>
        </View>

        {/* Level Progress Card */}
        <LevelProgressBar xp={xp} nextLevelXp={nextLevelXp} />

        {/* Stats Grid */}
        <View className="mt-10 px-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-main-bold text-[11px] uppercase tracking-[4px] text-slate-500">
              Core Metrics
            </Text>
            <Zap size={14} color="#6366f1" />
          </View>

          <View className="flex-row flex-wrap justify-between">
            {statsList.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </View>
        </View>

        {/* Referral Success Summary */}
        <View className="mt-6 px-5">
          <View className="overflow-hidden rounded-3xl border border-indigo-500/20 bg-indigo-500/5">
            <BlurView
              intensity={12}
              tint="dark"
              className="flex-row items-center px-5 py-5"
            >
              {/* ICON */}
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20">
                <Network size={22} color="#818cf8" />
              </View>

              {/* CENTER CONTENT */}
              <View className="ml-4 flex-1">
                <Text className="font-main-bold text-[10px] uppercase tracking-wide text-indigo-300">
                  Referrals
                </Text>

                <Text
                  numberOfLines={1}
                  className="mt-1 font-main-bold text-xl text-white"
                >
                  {referralStats.totalShares}
                </Text>
              </View>

              {/* RIGHT SIDE */}
              <View className="items-end justify-center">
                <Text className="text-[9px] uppercase tracking-wide text-white/40">
                  Earned
                </Text>

                <Text
                  numberOfLines={1}
                  className="mt-1 font-main-bold text-base text-yellow-500"
                >
                  {referralStats.totalEarned.toLocaleString()} 🪙
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Achievements Section */}
        <View className="mt-10 px-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-main-bold text-[11px] uppercase tracking-[4px] text-slate-500">
              Medals Case ({myAwards.length})
            </Text>
            <Medal size={14} color="#fbbf24" />
          </View>

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
            <View className="h-32 w-full items-center justify-center rounded-[32px] border-2 border-dashed border-white/5 bg-white/5">
              <Lock size={24} color="rgba(255,255,255,0.1)" />
              <Text className="mt-3 font-main-bold text-[10px] uppercase tracking-widest text-slate-600">
                Play games to win medals
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
