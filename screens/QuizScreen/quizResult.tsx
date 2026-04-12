import React, { useEffect, useCallback } from "react";
import { View, ScrollView, Image, BackHandler } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import useRandomMessage from "@/hooks/useRandomMessage";
import { AppDispatch, RootState } from "@/redux/store";
import { playerImages } from "@/constants/playerData";
import { resetDifficulty } from "@/redux/reducers/quiz";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/hooks/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { Ionicons } from "@expo/vector-icons";
import { QuizEngine } from "@/service/QuizEngine";
import { BotEngine } from "@/service/BotEngine";

/**
 * WHY this screen does NOT use useQuizGameLogic():
 * That hook starts timers, attaches packet listeners, and processes
 * incoming packets with setState. When packets arrive during QuizResult's
 * render cycle, React throws "Cannot update a component while rendering
 * a different component". This screen only needs navigation functions,
 * which are implemented directly here.
 */
export default function QuizResult() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  const Message = useRandomMessage(isWinner ? "winner" : "loser");
  const { reward, message: coinsAwarded } = useQuizReward();
  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

  // Stop all game activity when this screen mounts
  useEffect(() => {
    AudioEngine.stop("timer");
    BotEngine.reset(); // Kill bot listeners so they don't fire more packets
  }, []);

  const statusColor = isWinner ? "#10b981" : "#ef4444";

  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.png");
  };

  // Multiplayer final standings (read once, no hook needed)
  const isMultiplayer = Object.keys(QuizEngine.state.playerScores).length > 1;
  const standings = isMultiplayer
    ? Object.entries(QuizEngine.state.playerScores)
        .map(([id, stats]) => ({ playerId: id, ...stats }))
        .sort(
          (a, b) =>
            b.correctCount - a.correctCount || a.totalTime - b.totalTime,
        )
    : [];

  /* Navigation — implemented directly, not via useQuizGameLogic */
  const handleNavigation = useCallback(
    (targetRoute: string) => {
      try {
        dispatch(resetDifficulty());
        requestAnimationFrame(() => {
          router.dismissAll();
          router.replace(targetRoute as any);
        });
      } catch (err) {
        console.error("Navigation failed:", err);
      }
    },
    [dispatch, router],
  );

  const handleQuit = useCallback(
    () => handleNavigation("/mode-select"),
    [handleNavigation],
  );
  const handleStats = useCallback(
    () => handleNavigation("/stats"),
    [handleNavigation],
  );
  const handleEarn = useCallback(
    () => handleNavigation("/earn"),
    [handleNavigation],
  );

  // Block back button — force user to use the action buttons
  useEffect(() => {
    const backAction = () => {
      handleQuit();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => sub.remove();
  }, [handleQuit]);

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/80" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingTop: insets.top + hp(2),
          paddingBottom: hp(5),
        }}
      >
        <View className="items-center py-4">
          <Text
            className="font-main-bold text-[40px] tracking-tighter"
            style={{
              color: "white",
              textShadowColor: statusColor,
              textShadowRadius: 15,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            {isWinner ? "VICTORY" : "DEFEAT"}
          </Text>

          <View className="my-6 items-center">
            {/* Outer Glow / Ring Container */}
            <View
              style={{ width: wp(32), height: wp(32) }}
              className="items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-indigo-500/20"
            >
              {/* Inner Glass Frame */}
              <View
                style={{ width: wp(28), height: wp(28) }}
                className="items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md"
              >
                <Image
                  source={getAvatarSource(selectedImages[0] || 1)}
                  style={{ width: wp(20), height: wp(20) }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Refined Status Badge */}
            <View
              className="absolute -bottom-3 rounded-full border border-white/10 px-5 py-1.5 shadow-lg shadow-black/50"
              style={{ backgroundColor: statusColor }}
            >
              <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-white">
                {isWinner ? "Champion" : "Runner Up"}
              </Text>
            </View>
          </View>
        </View>

        <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
            accuracy={accuracy}
          />
        </View>

        {/* 🏆 FINAL STANDINGS */}
        {isMultiplayer && standings.length > 0 && (
          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between px-2">
              <Text className="font-main-bold text-lg text-white">
                Final Standings
              </Text>
              <Ionicons name="medal-outline" size={20} color="#818cf8" />
            </View>

            {standings.map((item, index) => {
              const isTop = index === 0;
              const medal =
                index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : null;
              return (
                <View
                  key={item.playerId}
                  className={`mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
                    isTop
                      ? "border-indigo-500/30 bg-indigo-500/10"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <View className="flex-1 flex-row items-center">
                    {/* Rank */}
                    <View className="w-8 items-center">
                      {medal ? (
                        <Text style={{ fontSize: 18 }}>{medal}</Text>
                      ) : (
                        <Text className="font-main-bold text-xs text-white/25">
                          #{index + 1}
                        </Text>
                      )}
                    </View>
                    {/* Square avatar */}
                    <View
                      style={{ width: wp(10), height: wp(10) }}
                      className="ml-2 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-white/10"
                    >
                      <Image
                        source={getAvatarSource(item.avatarId)}
                        style={{ width: wp(8), height: wp(8) }}
                        resizeMode="contain"
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className={`font-main-bold text-sm ${isTop ? "text-indigo-400" : "text-white"}`}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-[8px] uppercase tracking-widest text-white/20">
                        {index === 0 ? "Grand Champion" : `Rank #${index + 1}`}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="font-main-bold text-lg text-white">
                      {item.correctCount}
                    </Text>
                    <Text className="text-[8px] uppercase text-white/20">
                      Correct
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="mt-12 px-2">
          <ActionButtons
            onStatsPress={handleStats}
            onEarnPress={handleEarn}
            onHomePress={() => handleQuit()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
