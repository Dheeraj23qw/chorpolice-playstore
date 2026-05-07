import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlayButton from "@/components/RajamantriGameScreen/playButton";
import { OfflineInvestigationBanner } from "@/screens/OfflineGame/components/OfflineInvestigationBanner";

import { GamePlaySectionProps } from "./GamePlaySection/types";
import { useDealingStage } from "./GamePlaySection/hooks/useDealingStage";
import { useMysteryShuffle } from "./GamePlaySection/hooks/useMysteryShuffle";

import { RoundBadge } from "./GamePlaySection/components/RoundBadge";
import { GridCard } from "./GamePlaySection/components/GridCard";
import { getGridCardMotion } from "./components/GamePlaySection/utils/cardDealMotion";
import { InvestigationBoard } from "./components/GamePlaySection/components/InvestigationBoard";

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
  getCardStyle,
  showTableButton: _showTableButton,
  toggleModal: _toggleModal,
  isHighlight = false,
  invisibleIndices = [],
  localPlayerName: _localPlayerName = "Player",
  myRole: _myRole = null,
  gamePhase = "waiting",
  investigationTargets = [],
  popupIndex,
  dealAnimationPreset = "classicSpin",
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

  const isCinematicOrResult =
    popupIndex === 5 || popupIndex === 4 || popupIndex === 3;

  const buttonText = isPlayButtonDisabled
    ? message || `Round ${round}`
    : "Press me to play!";

  const getMotionForCard = useCallback(
    (index: number) =>
      getGridCardMotion({
        index,
        roles,
        invisibleIndices,
        gamePhase,
        dealingStage,
        dealAnimationPreset,
      }),
    [roles, invisibleIndices, gamePhase, dealingStage, dealAnimationPreset],
  );

  if (isCinematicOrResult) return null;

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View className="mb-10 mt-8 items-center">
          <RoundBadge round={round} />
        </View>

        <View className="mb-9">
          {isInvestigation ? (
            message ? (
              <OfflineInvestigationBanner message={message} />
            ) : null
          ) : (
            <PlayButton
              disabled={isPlayButtonDisabled}
              onPress={handlePlay}
              buttonText={buttonText}
            />
          )}
        </View>

        <View className="flex-col gap-y-8">
          {!isInvestigation ? (
            <>
              <View className="flex-row justify-between">
                {playerNames.slice(0, 2).map((name, index) => (
                  <GridCard
                    key={`${round}-${index}`}
                    index={index}
                    name={name}
                    round={round}
                    dealingStage={dealingStage}
                    dealAnimationPreset={dealAnimationPreset}
                    motion={getMotionForCard(index)}
                    handleCardClick={handleCardClick}
                    handleCardClickWithBounce={handleCardClickWithBounce}
                    roles={roles}
                    flippedStates={flippedStates}
                    clickedCards={clickedCards}
                    getCardStyle={getCardStyle}
                    isHighlight={isHighlight}
                    disabled
                  />
                ))}
              </View>

              <View className="flex-row justify-between">
                {playerNames.slice(2, 4).map((name, index) => {
                  const cardIndex = index + 2;

                  return (
                    <GridCard
                      key={`${round}-${cardIndex}`}
                      index={cardIndex}
                      name={name}
                      round={round}
                      dealingStage={dealingStage}
                      dealAnimationPreset={dealAnimationPreset}
                      motion={getMotionForCard(cardIndex)}
                      handleCardClick={handleCardClick}
                      handleCardClickWithBounce={handleCardClickWithBounce}
                      roles={roles}
                      flippedStates={flippedStates}
                      clickedCards={clickedCards}
                      getCardStyle={getCardStyle}
                      isHighlight={isHighlight}
                      disabled
                    />
                  );
                })}
              </View>
            </>
          ) : (
            <View className="items-center pt-1">
              <InvestigationBoard
                round={round}
                gamePhase={gamePhase}
                investigationTargets={investigationTargets}
                flippedStates={flippedStates}
                clickedCards={clickedCards}
                mysteryShuffleStep={mysteryShuffleStep}
                handleCardClick={handleCardClick}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
