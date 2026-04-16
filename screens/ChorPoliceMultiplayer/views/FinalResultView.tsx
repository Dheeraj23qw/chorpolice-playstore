import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import Animated, { FadeIn, ZoomIn, Layout } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { RootState } from "@/redux/store";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { VictoryCelebration } from "@/components/VictoryCelebration";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { hp } from "@/utils/responsive";
import { BlurView } from "expo-blur";

// Memoize to ensure premium, stutter-free performance
const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedWinnerSection = memo(WinnerSection);

const FinalResultView = ({ onExit, onPlayAgain }: any) => {
  const playerScoresRedux = useSelector(
    (state: RootState) => state.player.playerScores,
  );
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const playerNamesList = useSelector(
    (state: RootState) => state.player.playerNames,
  );

  const sortedScores = useMemo(() => {
    if (!playerScoresRedux?.length) return [];
    return [...playerScoresRedux].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0),
    );
  }, [playerScoresRedux]);

  const winner = sortedScores[0];
  const winnerIdx = playerNamesList.findIndex(
    (p) => p.name === winner?.playerName,
  );
  const winnerImage =
    winnerIdx >= 0
      ? playerImages[selectedImages[winnerIdx]]?.src
      : playerImages[1]?.src;
  const totalPot =
    ChorPoliceEngine.state.totalPot || ChorPoliceEngine.state.stake * 4;

  const [showCelebration, setShowCelebration] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = useCallback(async () => {
    const { captureScreen } = require("react-native-view-shot");
    const Sharing = require("expo-sharing");
    const uri = await captureScreen({ format: "png", quality: 0.9 });
    await Sharing.shareAsync(uri);
  }, []);

  return (
    <View className="flex-1 bg-gray-950">
      {showCelebration && (
        <VictoryCelebration type="GOLD" intensity="MEDIUM" duration={4000} />
      )}

      {/* WINNER SECTION: Pinned outside the ScrollView */}
      {winner && (
        <Animated.View entering={ZoomIn.duration(500)} className="pt-4">
          <MemoizedWinnerSection
            winnerName={winner.playerName}
            winnerImage={winnerImage}
            winner={winner}
          />
        </Animated.View>
      )}

      {/* LIST SECTION: Scrolls independently underneath the winner */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false} // Clean premium look
        removeClippedSubviews={true}
      >
        {totalPot > 0 && (
          <Animated.View
            entering={FadeIn.delay(200)}
            className="my-6 items-center"
          >
            {/* Simple Pill Border */}
            <View className="w-[92%] flex-row items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-950/20 px-6 py-4">
              <Text className="text-base font-medium text-indigo-100">
                You won
              </Text>
              <Text className="mx-2 text-base font-bold text-white">
                +{Number(totalPot || 0).toLocaleString()} coins
              </Text>
              <Text className="text-base">💰⚡</Text>
            </View>
          </Animated.View>
        )}

        <MemoizedLeaderboard
          sortedScores={sortedScores}
          playerNames={playerNamesList}
          selectedImages={selectedImages}
        />
        <Animated.View entering={FadeIn.delay(600)} className="mb-10 mt-8">
          <ActionButtons
            handlePlayAgain={onPlayAgain}
            handleShare={handleShare}
            isButtonDisabled={false}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default FinalResultView;
