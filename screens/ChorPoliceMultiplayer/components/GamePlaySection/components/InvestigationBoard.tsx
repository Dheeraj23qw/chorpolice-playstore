import React, { memo } from "react";
import { View } from "react-native";

import { MYSTERY_BOARD_HEIGHT, MYSTERY_BOARD_WIDTH } from "../constants";
import { InvestigationTarget } from "../types";
import { MysteryCard } from "./MysteryCard";

type InvestigationBoardProps = {
  round: number;
  gamePhase: string;
  investigationTargets: InvestigationTarget[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  mysteryShuffleStep: number;
  mysteryRevealStep?: number;
  handleCardClick: (index: number, targetId?: string) => void;
};

export const InvestigationBoard = memo(
  ({
    round,
    gamePhase,
    investigationTargets,
    flippedStates,
    clickedCards,
    mysteryShuffleStep,
    mysteryRevealStep = 0,
    handleCardClick,
  }: InvestigationBoardProps) => {
    if (__DEV__) {
      console.log("[CP_MYSTERY] Investigation board visible");
      console.log("[CP_MYSTERY] Old 4-card grid hidden");
    }

    return (
      <View className="items-center pt-1">
        <View
          style={{
            width: MYSTERY_BOARD_WIDTH,
            height: MYSTERY_BOARD_HEIGHT,
          }}
        >
          {investigationTargets.slice(0, 3).map((target, idx) => (
            <MysteryCard
              key={`${round}-${target.id}`}
              target={target}
              idx={idx}
              round={round}
              gamePhase={gamePhase}
              flippedStates={flippedStates}
              clickedCards={clickedCards}
              mysteryShuffleStep={mysteryShuffleStep}
              mysteryRevealStep={mysteryRevealStep}
              handleCardClick={handleCardClick}
            />
          ))}
        </View>
      </View>
    );
  },
);

InvestigationBoard.displayName = "InvestigationBoard";
