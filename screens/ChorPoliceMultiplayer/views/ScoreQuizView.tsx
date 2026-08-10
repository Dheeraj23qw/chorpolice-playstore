import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import QuizOptions from "@/components/chorPoliceQuiz/option";
import Timer from "@/components/thinkAndCountScreen/Timer";

import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { hp, rf } from "@/utils/responsive";

const ScoreQuizView = ({ g }: any) => {
  const players = g.scoreQuizPlayers?.length
    ? g.scoreQuizPlayers
    : ChorPoliceEngine.state.players;
  const currentPlayer = players[g.quizPlayerIndex];

  if (!currentPlayer) return null;

  const playerImage = playerImages[currentPlayer.avatarId] || playerImages[1];
  const isTargetPlayer = currentPlayer.id === g.localPlayerId;

  if (g.isDynamicPopUp && g.mediaId != null && g.mediaType != null) {
    return (
      <DynamicOverlayPopUp
        isPopUp={g.isDynamicPopUp}
        mediaId={g.mediaId}
        mediaType={g.mediaType}
        closeVisibleDelay={3000}
        playerData={g.playerData}
      />
    );
  }

  if (g.showQuizLeaderboard) {
    const leaderboard = ChorPoliceEngine.getLeaderboard();
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>ROUND RESULTS</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.map((entry, index) => (
              <View
                key={entry.id || index}
                style={[
                  styles.leaderboardRow,
                  index < leaderboard.length - 1 && styles.leaderboardRowBorder,
                ]}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.nameText} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={styles.scoreText}>
                  {entry.totalScore.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.quizHeader}>
            <View>
              <Text style={styles.eyebrow}>LEVEL 2 · SCORE BOOST</Text>
              <Text style={styles.headerTitle}>Guess the score</Text>
            </View>
            <Timer countdown={g.quizCountdown ?? 7} variant="compact" />
          </View>

          <QuizOptions
            playerName={currentPlayer.name}
            playerImage={playerImage}
            questionNumber={g.quizPlayerIndex + 1}
            totalQuestions={players.length}
            options={g.quizOptions}
            onOptionPress={g.handleQuizOption}
            isActivePlayer={!g.quizOptionDisabled}
            hasGuessed={g.hasGuessedThisRound}
            isTargetPlayer={isTargetPlayer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(3),
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  quizHeader: {
    minHeight: hp(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: rf(1.05),
    fontFamily: "main-bold",
    color: "#A5B4FC",
    letterSpacing: 1.5,
  },
  headerTitle: {
    marginTop: 2,
    fontSize: rf(2.5),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  leaderboardTitle: {
    marginBottom: 18,
    textAlign: "center",
    fontSize: rf(2.5),
    fontFamily: "main-bold",
    color: "#FACC15",
    letterSpacing: 2,
  },
  leaderboardCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#30335A",
    borderRadius: 24,
    backgroundColor: "#121424",
    paddingHorizontal: 16,
  },
  leaderboardRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
  },
  leaderboardRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#282A46",
  },
  rankBadge: {
    width: 34,
    height: 34,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#2E3261",
  },
  rankText: {
    fontSize: rf(1.6),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  nameText: {
    flex: 1,
    marginRight: 12,
    fontSize: rf(1.75),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  scoreText: {
    fontSize: rf(1.8),
    fontFamily: "main-bold",
    color: "#A5B4FC",
  },
});

export default ScoreQuizView;
