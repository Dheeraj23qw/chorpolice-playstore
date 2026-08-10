import React, { memo } from "react";
import { MotiView } from "moti";

import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { hp } from "@/utils/responsive";

import {
  MYSTERY_CARD_HEIGHT,
  MYSTERY_CARD_WIDTH,
  MYSTERY_SLOTS,
} from "../constants";
import { InvestigationTarget } from "../types";
import { getMysteryCardState, getMysteryMotion } from "../utils/mysteryMotion";

type MysteryCardProps = {
  target: InvestigationTarget;
  idx: number;
  round: number;
  gamePhase: string;
  flippedStates: boolean[];
  clickedCards: boolean[];
  mysteryShuffleStep: number;
  mysteryRevealStep: number;
  handleCardClick: (index: number, targetId?: string) => void;
};

export const MysteryCard = memo(
  ({
    target,
    idx,
    round,
    gamePhase,
    flippedStates,
    clickedCards,
    mysteryShuffleStep,
    mysteryRevealStep,
    handleCardClick,
  }: MysteryCardProps) => {
    const { physicalIndex, isFlipped, isClicked } = getMysteryCardState(
      target,
      idx,
      flippedStates,
      clickedCards,
    );
    const motion = getMysteryMotion(
      idx,
      isClicked,
      gamePhase,
      mysteryShuffleStep,
      mysteryRevealStep,
      round,
      target.id,
    );

    const isRevealSmash =
      gamePhase === "police_turn" && mysteryRevealStep > 0;

    return (
      <MotiView
        key={`${round}-${target.id}`}
        from={{
          opacity: 0,
          scale: 0.76,
          left: (MYSTERY_SLOTS[idx] ?? MYSTERY_SLOTS[0]).left,
          top: (MYSTERY_SLOTS[idx] ?? MYSTERY_SLOTS[0]).top + hp(3),
          rotateZ: idx === 1 ? "8deg" : "-8deg",
        }}
        animate={motion.animate}
        transition={motion.transition}
        style={{
          position: "absolute",
          width: MYSTERY_CARD_WIDTH,
          height: MYSTERY_CARD_HEIGHT,
          zIndex: isRevealSmash
            ? isClicked
              ? 50
              : 40 - idx
            : gamePhase === "investigation_shuffle"
              ? 40 - idx
              : idx + 1,
        }}
      >
        <PlayerCard
          index={physicalIndex}
          role={target.role}
          playerName="Mystery"
          flipped={isFlipped}
          clicked={isClicked}
          isCorrect={target.role === "Thief"}
          onClick={(index) => {
            if (gamePhase !== "police_turn") return;
            handleCardClick(index, target.id);
          }}
          onBounceEffect={() => {}}
          animatedStyle={{}}
          isHighlight={
            !isFlipped &&
            !isClicked &&
            (gamePhase === "police_turn" ||
              gamePhase === "investigation_shuffle")
          }
          disabled={gamePhase !== "police_turn" || isFlipped || isClicked}
          dimWhenClicked={mysteryRevealStep === 0}
        />
      </MotiView>
    );
  },
);

MysteryCard.displayName = "MysteryCard";
