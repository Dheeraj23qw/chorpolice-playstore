import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";

import {
  MYSTERY_CARD_HEIGHT,
  MYSTERY_CARD_WIDTH,
  MYSTERY_SHUFFLE_PATHS,
  MYSTERY_SHUFFLE_ROTATIONS,
  MYSTERY_SLOTS,
  MYSTERY_BOARD_HEIGHT,
  MYSTERY_BOARD_WIDTH,
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

// ─── Smash-out: deterministic "random" so every player sees the same ─────────

const SMASH_DIRECTIONS = [
  { dx: -1.9, dy: -0.4, rot: "-70deg" },
  { dx: 1.9, dy: -0.4, rot: "70deg" },
  { dx: -1.9, dy: 0.4, rot: "-75deg" },
  { dx: 1.9, dy: 0.4, rot: "75deg" },
  { dx: -2.1, dy: 0, rot: "-88deg" },
  { dx: 2.1, dy: 0, rot: "88deg" },
  { dx: 0, dy: -1.8, rot: "10deg" },
  { dx: 0, dy: 1.8, rot: "-10deg" },
] as const;

const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
};

/**
 * Picks a fixed fly-off target (offset + rotation) for a non-selected mystery
 * card. Seeded by round + card index + target id so ALL players compute the
 * exact same "random" direction (needed for the synced smash-out animation).
 */
export const getSmashTarget = (
  idx: number,
  round: number,
  targetId: string,
) => {
  const seed = hashString(`${round}-${idx}-${targetId}`);
  const dir = SMASH_DIRECTIONS[seed % SMASH_DIRECTIONS.length];
  return {
    left: dir.dx * MYSTERY_BOARD_WIDTH,
    top: dir.dy * MYSTERY_BOARD_HEIGHT,
    rotateZ: dir.rot,
  };
};

// ─── Motion ──────────────────────────────────────────────────────────────────

export const getMysteryMotion = (
  idx: number,
  isClicked: boolean,
  gamePhase: string,
  mysteryShuffleStep: number,
  mysteryRevealStep = 0,
  round = 1,
  targetId = "",
) => {
  // Police-reveal sequence: smash out the 2 unselected cards + rise the pick.
  if (gamePhase === "police_turn" && mysteryRevealStep > 0) {
    if (isClicked) {
      // Selected card rises up toward the viewer — still covered until flip.
      return {
        animate: {
          left: (MYSTERY_BOARD_WIDTH - MYSTERY_CARD_WIDTH) / 2,
          top: (MYSTERY_BOARD_HEIGHT - MYSTERY_CARD_HEIGHT) / 2 - 6,
          opacity: 1,
          scale: 1.35,
          rotateZ: "0deg",
        },
        transition: {
          type: "spring" as const,
          damping: 12,
          stiffness: 140,
        },
      };
    }

    // Non-selected cards get smashed off the board in a synced random direction.
    const smash = getSmashTarget(idx, round, targetId);
    return {
      animate: {
        left: smash.left,
        top: smash.top,
        opacity: 0,
        scale: 1.15,
        rotateZ: smash.rotateZ,
      },
      transition: {
        type: "timing" as const,
        duration: CP_FLOW_TIMINGS.MYSTERY_SMASH_OUT_MS,
      },
    };
  }

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
