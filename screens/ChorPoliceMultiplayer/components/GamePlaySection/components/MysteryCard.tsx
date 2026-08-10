import React, { memo, useMemo } from "react";
import { MotiView } from "moti";

import { ChorSipahiCard } from "@/components/ChorSipahiCard";
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
  isLocalPlayer?: boolean;
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
    isLocalPlayer = false,
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
      target.id,
    );

    const isRevealSmash = mysteryRevealStep > 0;

    // Referentially stable `from` — only used on the very first mount. All
    // later movement (shuffle, smash-out, rise-to-center) is driven by
    // `animate` changes on this SAME mounted view, exactly like the shuffle
    // and the card flip, which both animate reliably.
    const slot = MYSTERY_SLOTS[idx] ?? MYSTERY_SLOTS[0];
    const dealFrom = useMemo(
      () => ({
        opacity: 0,
        scale: 0.76,
        left: slot.left,
        top: slot.top + hp(3),
        rotateZ: idx === 1 ? "8deg" : "-8deg",
      }),
      [slot, idx],
    );

    return (
      <MotiView
        key={`${round}-${target.id}`}
        from={dealFrom}
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
        <ChorSipahiCard
          index={physicalIndex}
          player={{ name: "Mystery", avatarId: 0 }}
          role={target.role}
          isFlipped={isFlipped}
          isClicked={isClicked}
          onPress={(index: number) => {
            if (gamePhase !== "police_turn") return;
            handleCardClick(index, target.id);
          }}
          disabled={gamePhase !== "police_turn" || isFlipped || isClicked}
          phase={gamePhase}
          isHighlight={
            !isLocalPlayer &&
            !isFlipped &&
            !isClicked &&
            (gamePhase === "police_turn" ||
              gamePhase === "investigation_shuffle")
          }
          isLocalPlayer={isLocalPlayer}
          isMystery
        />
      </MotiView>
    );
  },
);

MysteryCard.displayName = "MysteryCard";
