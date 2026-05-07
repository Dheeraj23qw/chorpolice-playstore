import React, { memo } from "react";
import { View } from "react-native";

import { CardDealPreset } from "@/redux/reducers/sessionSlice";

import { DealingStage } from "../types";
import {
  getCardStartStyle,
  getGridCardMotion,
} from "../utils/cardDealMotion";
import { GridCard } from "./GridCard";

type CardGridProps = {
  round: number;
  roles: string[];
  playerNames: string[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  isHighlight?: boolean;
  invisibleIndices: number[];
  gamePhase: string;
  dealingStage: DealingStage;
  dealAnimationPreset: CardDealPreset;
  handleCardClick: (index: number, targetId?: string) => void;
  handleCardClickWithBounce: (index: number) => void;
  getCardStyle: (index: number) => any;
};

export const CardGrid = memo(
  ({
    round,
    roles,
    playerNames,
    flippedStates,
    clickedCards,
    isHighlight,
    invisibleIndices,
    gamePhase,
    dealingStage,
    dealAnimationPreset,
    handleCardClick,
    handleCardClickWithBounce,
    getCardStyle,
  }: CardGridProps) => {
    const renderGridCard = (index: number, name: string) => {
      const motion = getGridCardMotion({
        index,
        roles,
        invisibleIndices,
        gamePhase,
        dealingStage,
        dealAnimationPreset,
      });
      const startStyle = getCardStartStyle(dealAnimationPreset, index);

      return (
        <GridCard
          key={`${round}-${index}`}
          index={index}
          name={name}
          round={round}
          role={roles[index] ?? ""}
          flipped={flippedStates[index] ?? false}
          clicked={clickedCards[index] ?? false}
          isHighlight={isHighlight}
          startStyle={startStyle}
          motion={motion}
          handleCardClick={handleCardClick}
          handleCardClickWithBounce={handleCardClickWithBounce}
          getCardStyle={getCardStyle}
        />
      );
    };

    return (
      <>
        <View className="flex-row justify-between">
          {playerNames
            .slice(0, 2)
            .map((name, index) => renderGridCard(index, name))}
        </View>

        <View className="flex-row justify-between">
          {playerNames
            .slice(2, 4)
            .map((name, index) => renderGridCard(index + 2, name))}
        </View>
      </>
    );
  },
);

CardGrid.displayName = "CardGrid";
