import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";
import Timer from "@/components/thinkAndCountScreen/Timer";

import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";

const ScoreQuizView = ({ g }: any) => {
  const players = g.scoreQuizPlayers?.length
    ? g.scoreQuizPlayers
    : ChorPoliceEngine.state.players;
  const currentPlayer = players[g.quizPlayerIndex];

  if (!currentPlayer) return null;

  const avatarId = currentPlayer.avatarId;
  const playerImage = playerImages[avatarId] || playerImages[1];
  const isTargetPlayer = currentPlayer.id === g.localPlayerId;

  // Calculate local player's current Level 2 bonus
  const localScoreEntry = ChorPoliceEngine.state.scores[g.localPlayerId];
  const l2Bonus = localScoreEntry?.level2Bonus ?? 0;
  const formattedL2Bonus = l2Bonus >= 0 ? `+${l2Bonus.toLocaleString()}` : l2Bonus.toLocaleString();

  /* ───────── FULL SCREEN POPUP ───────── */
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

  /* ───────── LEADERBOARD AFTER ROUND ───────── */
  if (g.showQuizLeaderboard) {
    const leaderboard = ChorPoliceEngine.getLeaderboard();
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>🏆 LEADERBOARD</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.map((entry, idx) => (
              <View key={entry.id || idx} style={styles.leaderboardRow}>
                <Text style={styles.rankText}>{idx + 1}.</Text>
                <Text style={styles.nameText}>{entry.name}</Text>
                <Text style={styles.scoreText}>{entry.totalScore.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ───────── QUIZ UI ───────── */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* ⏱️ TOP TIMER (Reusing Think & Count Timer component) */}
          <View style={styles.timerWrapper}>
            <Timer countdown={g.quizCountdown ?? 7} />
          </View>

          {/* SUBJECT PLAYER INFO */}
          <View style={styles.playerInfoContainer}>
            <View style={styles.glowEffect} />

            <PlayerInfo playerImage={playerImage} />

            <View style={styles.nameContainer}>
              <Text style={[styles.playerName, { fontSize: rf(2) }]}>
                {currentPlayer.name}
              </Text>

              <Text style={[styles.playerCount, { fontSize: rf(1) }]}>
                Question {g.quizPlayerIndex + 1} of {players.length}
              </Text>
            </View>
          </View>

          {/* QUIZ BOX */}
          <View style={styles.quizBox}>
            <QuizOptions
              playerName={currentPlayer.name}
              options={g.quizOptions}
              onOptionPress={g.handleQuizOption}
              isActivePlayer={!g.quizOptionDisabled}
              hasGuessed={g.hasGuessedThisRound}
              isTargetPlayer={isTargetPlayer}
            />
          </View>

          {/* 🏆 BOTTOM: PLAYER'S OWN L2 BONUS */}
          <View style={styles.bonusFooter}>
            <Text style={styles.bonusLabel}>Your L2 Bonus</Text>
            <Text style={[
              styles.bonusValue,
              { color: l2Bonus > 0 ? '#4ADE80' : (l2Bonus < 0 ? '#F87171' : '#A5B4FC') }
            ]}>
              {formattedL2Bonus}
            </Text>
          </View>
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
    paddingBottom: hp(4),
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'center',
  },
  timerWrapper: {
    marginBottom: 10,
    alignItems: 'center',
  },
  playerInfoContainer: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    width: wp(50),
    height: hp(12),
    position: "absolute",
    top: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  nameContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  playerName: {
    fontFamily: 'main-bold',
    color: '#FFFFFF',
  },
  playerCount: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  quizBox: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  bonusFooter: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  bonusLabel: {
    fontSize: rf(1.1),
    fontFamily: 'main-bold',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bonusValue: {
    fontSize: rf(2.2),
    fontFamily: 'main-bold',
    marginTop: 2,
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: rf(2.8),
    fontFamily: 'main-bold',
    color: '#FACC15',
    marginBottom: 24,
    letterSpacing: 2,
  },
  leaderboardCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  rankText: {
    fontSize: rf(2),
    fontFamily: 'main-bold',
    color: '#FACC15',
    width: 36,
  },
  nameText: {
    flex: 1,
    fontSize: rf(2),
    fontFamily: 'main-bold',
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: rf(2.2),
    fontFamily: 'main-bold',
    color: '#6366F1',
  },
});

export default ScoreQuizView;
