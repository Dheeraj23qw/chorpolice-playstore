import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OfflineCountdownBadge } from "@/screens/OfflineGame/components/OfflineCountdownBadge";
import PlayButton from "@/components/RajamantriGameScreen/playButton";

import { useDealingStage } from "./hooks/useDealingStage";
import { useMysteryShuffle } from "./hooks/useMysteryShuffle";
import { GamePlaySectionProps } from "./types";
import { CardGrid } from "./components/CardGrid";
import { InvestigationBoard } from "./components/InvestigationBoard";
import { RoundBadge } from "./components/RoundBadge";

export const GamePlaySection: React.FC<GamePlaySectionProps> = ({
  isPlayButtonDisabled,
  handlePlay,
  roles,
  playerNames,
  flippedStates,
  clickedCards,
  handleCardClick,
  handleCardClickWithBounce,
  round,
  message,
  countdown,
  getCardStyle,
  isHighlight,
  invisibleIndices = [],
  gamePhase = "waiting",
  investigationTargets = [],
  popupIndex,
  dealAnimationPreset = "classicSpin",
  mysteryRevealStep = 0,
}) => {
  const dealingStage = useDealingStage(gamePhase, round);

  const mysteryShuffleStep = useMysteryShuffle(
    gamePhase,
    round,
    investigationTargets.length,
  );

  const isInvestigation =
    (gamePhase === "police_turn" ||
      gamePhase === "investigation_shuffle" ||
      gamePhase === "result" ||
      popupIndex === 4 ||
      popupIndex === 3) &&
    investigationTargets.length > 0;

  const buttonText = isPlayButtonDisabled
    ? message || `Round ${round}`
    : "Press me to play!";

  // ── Keep the board MOUNTED during cinematic/result popups ──────────────
  // Previously this was `if (isCinematicOrResult) return null;` which
  // destroyed the MotiView tree mid-animation, killing smash-out / rise /
  // flip. Now we hide it visually so the animations keep running.
  const isCinematicOrResult =
    popupIndex === 5 || popupIndex === 4 || popupIndex === 3;

  const shouldShowCountdown = typeof countdown === "number" && countdown > 0;
  return (
    <SafeAreaView
      className="flex-1 bg-transparent"
      style={isCinematicOrResult ? styles.hiddenButMounted : undefined}
      pointerEvents={isCinematicOrResult ? "none" : "auto"}
    >
      <View className="relative flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          <RoundBadge round={round} />

          <View className="mb-9">
            {!isInvestigation && (
              <PlayButton
                disabled={isPlayButtonDisabled}
                onPress={handlePlay}
                buttonText={buttonText}
              />
            )}
          </View>

          <View className="flex-col gap-y-8">
            {!isInvestigation ? (
              <CardGrid
                round={round}
                roles={roles}
                playerNames={playerNames}
                flippedStates={flippedStates}
                clickedCards={clickedCards}
                isHighlight={isHighlight}
                invisibleIndices={invisibleIndices}
                gamePhase={gamePhase}
                dealingStage={dealingStage}
                dealAnimationPreset={dealAnimationPreset}
                handleCardClick={handleCardClick}
                handleCardClickWithBounce={handleCardClickWithBounce}
                getCardStyle={getCardStyle}
              />
            ) : (
              <InvestigationBoard
                round={round}
                gamePhase={gamePhase}
                investigationTargets={investigationTargets}
                flippedStates={flippedStates}
                clickedCards={clickedCards}
                mysteryShuffleStep={mysteryShuffleStep}
                mysteryRevealStep={mysteryRevealStep}
                handleCardClick={handleCardClick}
              />
            )}
          </View>
        </ScrollView>

        {shouldShowCountdown && (
          <View pointerEvents="none" style={styles.countdownOverlay}>
            <OfflineCountdownBadge value={countdown} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  hiddenButMounted: {
    opacity: 0,
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
  },
});
