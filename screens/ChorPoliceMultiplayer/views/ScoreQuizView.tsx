import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";

import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";

const ScoreQuizView = ({ g }: any) => {
  const players = ChorPoliceEngine.state.players;
  const currentPlayer = players[g.quizPlayerIndex];

  if (!currentPlayer) return null;

  const avatarId = currentPlayer.avatarId;
  const playerImage = playerImages[avatarId] || playerImages[1];
  const isMyTurn = currentPlayer.id === g.localPlayerId;

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

  /* ───────── QUIZ UI ───────── */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* PLAYER INFO */}
          <View style={styles.playerInfoContainer}>
            <View style={styles.glowEffect} />

            <PlayerInfo playerImage={playerImage} />

            <View style={styles.nameContainer}>
              <Text style={[styles.playerName, { fontSize: rf(2) }]}>
                {currentPlayer.name}
              </Text>

              <Text style={[styles.playerCount, { fontSize: rf(1) }]}>
                Player {g.quizPlayerIndex + 1} of {players.length}
              </Text>
            </View>
          </View>

          {/* QUIZ BOX */}
          <View style={styles.quizBox}>
            <QuizOptions
              playerName={currentPlayer.name}
              options={g.quizOptions}
              onOptionPress={g.handleQuizOption}
              isActivePlayer={isMyTurn}
            />
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
    paddingBottom: hp(5),
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  playerInfoContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    width: wp(60),
    height: hp(15),
    position: "absolute",
    top: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  nameContainer: {
    marginTop: 8,
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
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
  },
});

export default ScoreQuizView;