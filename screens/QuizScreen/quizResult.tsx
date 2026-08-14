import React, { useEffect, useCallback, useState } from "react";
import { View, ScrollView, Image, BackHandler } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { hp, wp } from "@/utils/responsive";
import { Text } from "@/components/Text";
import useRandomMessage from "@/hooks/useRandomMessage";
import { AppDispatch, RootState } from "@/redux/store";
import { playerImages } from "@/constants/playerData";
import { resetDifficulty, setWinner } from "@/redux/reducers/quiz";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/features/gameStats/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { StandingsDropdown } from "./components/StandingsDropdown";
import CoinBalanceRow from "./components/CoinBalanceRow";

import { QuizEngine } from "@/service/QuizEngine";
import { BotEngine } from "@/service/QuizBotEngine";
import { stopSession } from "@/service/lanGameService";

import CustomRatingModal from "@/modal/RatingModal";
import {
  hasRatingCompleted,
  markRatingCompleted,
  incrementDismissCount,
} from "@/hooks/useRatingPrompt";
import { handleShare } from "@/utils/share";

export default function QuizResult() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isMultiplayer = Object.keys(QuizEngine.state.playerScores).length > 1;

  const [showStandings, setShowStandings] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);

  console.log("[QUIZ_RESULT] Correct:", Correct, "Total:", Total, "isWinner:", isWinner);

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  const coins = useSelector((state: RootState) => state.wallet.coins);

  const sessionState = useSelector((state: RootState) => state.session);

  const Motivational_Message = useRandomMessage(isWinner ? "winner" : "loser");

  const { reward: coinsAwarded } = useQuizReward();

  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

  const accuracyBonus = coinsAwarded;
  const betAmount = QuizEngine.state.stake;

  const handleRatingSuccess = () => {
    markRatingCompleted();
    setIsRatingModalVisible(false);
  };

  useEffect(() => {
    AudioEngine.stop("timer");
    BotEngine.reset();
  }, []);

  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];

    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.webp");
  }, []);

  const standings = isMultiplayer
    ? Object.entries(QuizEngine.state.playerScores)
        .map(([id, stats]) => ({
          playerId: id,
          ...stats,
        }))
        .sort(
          (a, b) =>
            b.correctCount - a.correctCount || a.totalTime - b.totalTime,
        )
    : [];

  const winnerId = standings.length > 0 ? standings[0].playerId : null;

  useEffect(() => {
    if (standings.length > 0) {
      dispatch(setWinner(sessionState.localPlayerId === standings[0].playerId));
    }
  }, [standings, dispatch, sessionState.localPlayerId]);

  const handleNavigation = useCallback(
    (targetRoute: string) => {
      stopSession();
      QuizEngine.reset();
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.replace(targetRoute as any);
      });
    },
    [dispatch, router],
  );

  useEffect(() => {
    const backAction = () => {
      handleNavigation("/mode-select");
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => sub.remove();
  }, [handleNavigation]);

  return (
    <View className="flex-1 bg-black">
      {/* BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
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
        {/* HEADER */}
        <View className="mb-4 items-center py-4">
          <Text className="font-main-bold text-[40px] tracking-tighter text-white">
            {isWinner ? "VICTORY" : "DEFEAT"}
          </Text>
        </View>

        {/* RESULT INFO */}
        {!showStandings && (
          <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">
            <ResultInfo
              Correct={Correct}
              Total={Total}
              Message={Motivational_Message}
              isWinner={isWinner}
              accuracy={accuracy}
              avatarSource={getAvatarSource(selectedImages[0] || 1)}
            />
          </View>
        )}

        {/* COINS / ACCURACY BONUS / MATCH EARNING */}
        {!showStandings && (
          <CoinBalanceRow
            coins={coins}
            accuracyBonus={accuracyBonus}
            betAmount={betAmount}
            isWinner={isWinner}
          />
        )}

        {/* STANDINGS */}
        <StandingsDropdown
          standings={standings}
          getAvatarSource={getAvatarSource}
          isOpen={showStandings}
          onToggle={setShowStandings}
          betAmount={betAmount}
          winnerId={winnerId}
        />

        {/* ACTION BUTTONS */}
        <View className="mt-12 px-2">
          <ActionButtons
            onReportBugPress={() => handleNavigation("/report-bug")}
            onRatePress={
              hasRatingCompleted()
                ? undefined
                : () => setIsRatingModalVisible(true)
            }
            onSharePress={
              hasRatingCompleted() ? () => handleShare() : undefined
            }
            onHomePress={() => handleNavigation("/mode-select")}
          />
        </View>
      </ScrollView>

      {/* RATING MODAL */}
      <CustomRatingModal
        visible={isRatingModalVisible}
        onClose={() => {
          incrementDismissCount();
          setIsRatingModalVisible(false);
        }}
        onSuccess={handleRatingSuccess}
        title="Rate Chor Police"
      />
    </View>
  );
}
