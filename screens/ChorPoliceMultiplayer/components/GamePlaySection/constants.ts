import { hp, wp } from "@/utils/responsive";

export const DEALING_SPIN_MS = 2500;
export const FADE_START_MS = DEALING_SPIN_MS;
export const PUBLIC_REVEAL_SETTLE_MS = 1400;

export const MYSTERY_CARD_WIDTH = wp(38);
export const MYSTERY_CARD_HEIGHT = (MYSTERY_CARD_WIDTH * 4.2) / 3;
export const MYSTERY_CARD_GAP = wp(5);
export const MYSTERY_BOARD_WIDTH = MYSTERY_CARD_WIDTH * 2 + MYSTERY_CARD_GAP;
export const MYSTERY_BOARD_HEIGHT = MYSTERY_CARD_HEIGHT * 2 + hp(4);

export const MYSTERY_SLOTS = [
  { left: 0, top: 0 },
  { left: MYSTERY_CARD_WIDTH + MYSTERY_CARD_GAP, top: 0 },
  {
    left: (MYSTERY_BOARD_WIDTH - MYSTERY_CARD_WIDTH) / 2,
    top: MYSTERY_CARD_HEIGHT + hp(3),
  },
] as const;

export const MYSTERY_SHUFFLE_PATHS = [
  [0, 1, 2, 0],
  [1, 2, 0, 1],
  [2, 0, 1, 2],
] as const;

export const MYSTERY_SHUFFLE_ROTATIONS = [
  ["-8deg", "10deg", "-12deg", "0deg"],
  ["8deg", "-6deg", "10deg", "0deg"],
  ["0deg", "-10deg", "7deg", "0deg"],
] as const;
