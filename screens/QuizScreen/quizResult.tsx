import React, { useEffect } from "react";
import { View, ScrollView, Image, BackHandler } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import useRandomMessage from "@/hooks/useRandomMessage";
import { RootState } from "@/redux/store";
import { playerImages } from "@/constants/playerData";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/hooks/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
import { Ionicons } from "@expo/vector-icons";
import { QuizEngine } from "@/service/QuizEngine";

export default function QuizResult() {
  const insets = useSafeAreaInsets();
  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  const { handleQuit, handleStats, handleEarn } = useQuizGameLogic();

  const Message = useRandomMessage(isWinner ? "winner" : "loser");
  const { reward, message: coinsAwarded } = useQuizReward();
  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

  useEffect(() => {
    AudioEngine.stop("timer");
  }, [isWinner]);

  const statusColor = isWinner ? "#10b981" : "#ef4444";

  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.png");
  };

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

          <View className="my-6">
            <View className="h-32 w-32 items-center justify-center overflow-hidden rounded-[40px] border-4 border-white/10 bg-white/5 shadow-2xl">
              <Image
                source={getAvatarSource(selectedImages[0] || 1)}
                className="h-24 w-24"
                resizeMode="contain"
              />
            </View>
            <View
              className="absolute -bottom-2 self-center rounded-full border border-white/20 bg-black px-4 py-1"
              style={{ backgroundColor: statusColor }}
            >
              <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white">
                {isWinner ? "Champion" : "Runner Up"}
              </Text>
            </View>
          </View>
        </View>

        <View className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-2xl">
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
            accuracy={accuracy}
          />
        </View>

        {/* 🏆 FINAL STANDINGS (User Request: leader boards type ui in multi quizresult) */}
        {Object.keys(QuizEngine.state.playerScores).length > 1 && (
          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between px-2">
              <Text className="font-main-bold text-lg text-white">
                Final Standings
              </Text>
              <Ionicons name="medal-outline" size={20} color="#818cf8" />
            </View>

            {Object.entries(QuizEngine.state.playerScores)
              .map(([id, stats]) => ({ playerId: id, ...stats }))
              .sort((a, b) => b.correctCount - a.correctCount)
              .map((item, index) => {
                const isWinner = index === 0;
                return (
                  <View
                    key={item.playerId}
                    className={`mb-3 flex-row items-center justify-between rounded-3xl border p-4 ${
                      isWinner
                        ? "border-indigo-500/30 bg-indigo-500/10"
                        : "border-white/5 bg-white/5"
                    }`}
                  >
                    <View className="flex-1 flex-row items-center">
                      <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-white/10">
                        <Image
                          source={getAvatarSource(item.avatarId)}
                          className="h-8 w-8"
                          resizeMode="contain"
                        />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text
                          className={`font-main-bold text-sm ${isWinner ? "text-indigo-400" : "text-white"}`}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-[8px] uppercase tracking-widest text-white/20">
                          {index === 0
                            ? "Grand Champion"
                            : `Rank #${index + 1}`}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="font-main-bold text-lg text-white">
                        {item.correctCount}
                      </Text>
                      <Text className="text-[8px] uppercase text-white/20">
                        Answers
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
