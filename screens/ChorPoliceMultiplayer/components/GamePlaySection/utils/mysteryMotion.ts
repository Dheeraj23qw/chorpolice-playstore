import {
  MYSTERY_SHUFFLE_PATHS,
  MYSTERY_SHUFFLE_ROTATIONS,
  MYSTERY_SLOTS,
} from "../constants";
import { InvestigationTarget } from "../types";

export const getMysteryCardState = (
  _target: InvestigationTarget,
  idx: number,
  flippedStates: boolean[],
  clickedCards: boolean[],
) => {
  const physicalIndex = 10 + idx;

  return {
    physicalIndex,
    isFlipped: flippedStates[physicalIndex] || false,
    isClicked: clickedCards[physicalIndex] || false,
  };
};

export const getMysteryMotion = (
  idx: number,
  isClicked: boolean,
  gamePhase: string,
  mysteryShuffleStep: number,
) => {
  const route =
    gamePhase === "investigation_shuffle"
      ? (MYSTERY_SHUFFLE_PATHS[idx]?.[mysteryShuffleStep] ?? idx)
      : idx;
  const slot = MYSTERY_SLOTS[route] ?? MYSTERY_SLOTS[idx] ?? MYSTERY_SLOTS[0];

  return {
    animate: {
      left: slot.left,
      top: slot.top,
      opacity: 1,
      scale:
        isClicked && gamePhase === "police_turn"
          ? 1.05
          : gamePhase === "investigation_shuffle"
            ? 1.02
            : 1,
      rotateZ:
        gamePhase === "investigation_shuffle"
          ? (MYSTERY_SHUFFLE_ROTATIONS[idx]?.[mysteryShuffleStep] ?? "0deg")
          : "0deg",
    },
    transition: {
      type: "timing" as const,
      duration: gamePhase === "investigation_shuffle" ? 440 : 260,
    },
  };
};
