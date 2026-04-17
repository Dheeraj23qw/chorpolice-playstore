import React, { useMemo, useCallback, memo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState } from "@/redux/store";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";

const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedWinnerSection = memo(WinnerSection);

const FinalResultView = ({ onExit, onPlayAgain }: any) => {
  const playerScoresRedux = useSelector((state: RootState) => state.player.playerScores);
  const selectedImages = useSelector((state: RootState) => state.player.selectedImages);
  const playerNamesList = useSelector((state: RootState) => state.player.playerNames);

  const sortedScores = useMemo(() => {
    if (!playerScoresRedux?.length) return [];
    return [...playerScoresRedux].sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
  }, [playerScoresRedux]);

  const winner = sortedScores[0];
  const winnerIdx = playerNamesList.findIndex((p) => p.name === winner?.playerName);
  const winnerImage = winnerIdx >= 0 ? playerImages[selectedImages[winnerIdx]]?.src : playerImages[1]?.src;
  const totalPot = ChorPoliceEngine.state.totalPot || ChorPoliceEngine.state.stake * 4;

  const handleShare = useCallback(async () => {
    const { captureScreen } = require("react-native-view-shot");
    const Sharing = require("expo-sharing");
    const uri = await captureScreen({ format: "png", quality: 0.9 });
    await Sharing.shareAsync(uri);
  }, []);

  return (
    // SafeAreaView handles the top notch and bottom home indicator automatically
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      
      {/* WINNER SECTION */}
      {winner && (
        <View style={styles.winnerContainer}>
          <MemoizedWinnerSection
            winnerName={winner.playerName}
            winnerImage={winnerImage}
            winner={winner}
          />
        </View>
      )}

      {/* POT SECTION */}
      {totalPot > 0 && (
        <View style={styles.potContainer}>
          <View style={styles.potPill}>
            <Text style={styles.potText}>You won</Text>
            <Text style={styles.potAmount}>
              + {Number(totalPot || 0).toLocaleString()} coins
            </Text>
            <Text style={styles.potEmoji}>💰⚡</Text>
          </View>
        </View>
      )}

      {/* LIST SECTION */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <MemoizedLeaderboard
          sortedScores={sortedScores}
          playerNames={playerNamesList}
          selectedImages={selectedImages}
        />
        <View style={styles.buttonContainer}>
          <ActionButtons
            handlePlayAgain={onPlayAgain}
            handleShare={handleShare}
            isButtonDisabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Set background color here to avoid flashing
  },
  winnerContainer: {
    paddingTop: 16,
  },
  potContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  potPill: {
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    backgroundColor: "rgba(30, 27, 75, 0.4)",
    paddingVertical: 12,
  },
  potText: { fontSize: 16, fontWeight: "500", color: "#e0e7ff" },
  potAmount: { marginHorizontal: 8, fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  potEmoji: { fontSize: 16 },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  buttonContainer: {
    marginBottom: 40,
    marginTop: 32,
  },
});

export default memo(FinalResultView);