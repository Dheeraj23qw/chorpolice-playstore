import { CardDealPreset } from "@/redux/reducers/sessionSlice";
import { hp, wp } from "@/utils/responsive";

import { DEALING_SPIN_MS, FADE_START_MS } from "../constants";
import { DealingStage } from "../types";

const offX = wp(18);
const offY = hp(12);

const getCenterOffset = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;

  return {
    x: isLeft ? wp(23) : -wp(23),
    y: isTop ? hp(12) : -hp(12),
  };
};

const getSmallStackOffset = (index: number) => {
  const offsets = [
    { x: 5, y: 5, rotate: -8 },
    { x: -5, y: 5, rotate: 8 },
    { x: 5, y: -5, rotate: 6 },
    { x: -5, y: -5, rotate: -6 },
  ];

  return offsets[index % offsets.length];
};

const deg = (value: number) => `${value}deg`;

/**
 * Start all cards near center like a real deck.
 */
export const getNeutralCenterStart = (index: number) => {
  const center = getCenterOffset(index);
  const stack = getSmallStackOffset(index);

  return {
    translateX: center.x + stack.x,
    translateY: center.y + stack.y,
    rotate: deg(stack.rotate),
    scale: 0.92,
    opacity: 0,
  };
};

/**
 * classicSpin
 * Center spinning deck.
 */
export const getClassicShuffle = (index: number) => {
  return {
    translateX: index % 2 === 0 ? 5 : -5,
    translateY: index < 2 ? 5 : -5,
    rotate: "1080deg",
    scale: 1,
    opacity: 1,
  };
};

/**
 * tornadoDeal
 * Big outward 360-degree card-table movement.
 */
export const getTornadoShuffle = (index: number) => {
  return {
    translateX: index % 2 === 0 ? offX : -offX,
    translateY: index < 2 ? offY : -offY,
    rotate: "360deg",
    scale: 1.05,
    opacity: 1,
  };
};

/**
 * waveDeal start
 * Cards begin from opposite side, like being thrown/dealt.
 */
export const getWaveStart = (index: number) => {
  const center = getCenterOffset(index);

  return {
    translateX: center.x,
    translateY: center.y,
    rotate: index % 2 === 0 ? "-25deg" : "25deg",
    scale: 0.85,
    opacity: 0,
  };
};

/**
 * waveDeal
 * Opposite-side throw deal.
 */
export const getWaveShuffle = (index: number) => {
  return {
    translateX: index % 2 === 0 ? -offX : offX,
    translateY: index < 2 ? offY : -offY,
    rotate: "-180deg",
    scale: 0.95,
    opacity: 1,
  };
};

/**
 * orbitDeal start
 * Start farther from center for stronger orbit feel.
 */
export const getOrbitStart = (index: number) => {
  const angle = (index * Math.PI) / 2;
  const radius = wp(45);

  return {
    translateX: Math.cos(angle) * radius,
    translateY: Math.sin(angle) * radius,
    rotate: deg(index * 90),
    scale: 0.55,
    opacity: 0,
  };
};

/**
 * orbitDeal
 * Bigger movement with 540-degree orbit spin.
 */
export const getOrbitShuffle = (index: number) => {
  return {
    translateX: index % 2 === 0 ? offX * 1.2 : -offX * 1.2,
    translateY: index < 2 ? offY * 1.2 : -offY * 1.2,
    rotate: "540deg",
    scale: 1.1,
    opacity: 1,
  };
};

/**
 * popBurstDeal start
 * Cards compressed in center deck.
 */
export const getPopBurstStart = (_index: number) => {
  return {
    translateX: 0,
    translateY: 0,
    rotate: "0deg",
    scale: 0.05,
    opacity: 0,
  };
};

/**
 * popBurstDeal
 * Reverse vortex burst.
 */
export const getPopBurstShuffle = (index: number) => {
  return {
    translateX: index % 2 === 0 ? -offX * 0.8 : offX * 0.8,
    translateY: index < 2 ? offY * 0.8 : -offY * 0.8,
    rotate: "-720deg",
    scale: 0.85,
    opacity: 1,
  };
};

export const getOfflineRevealPlacement = (index: number, role: string) => {
  const isTopRow = index < 2;
  const isLeftCol = index % 2 === 0;

  let translateX = isLeftCol ? wp(24) : -wp(24);
  let translateY = isTopRow ? hp(13) : -hp(13);
  let zIndex = 10;

  if (role === "Police") {
    translateX += wp(12);
    translateY += hp(7);
    zIndex = 20;
  }

  return { translateX, translateY, zIndex };
};

export const getCardStartStyle = (preset: CardDealPreset, index: number) => {
  switch (preset) {
    case "classicSpin":
    case "tornadoDeal":
      return getNeutralCenterStart(index);

    case "waveDeal":
      return getWaveStart(index);

    case "orbitDeal":
      return getOrbitStart(index);

    case "popBurstDeal":
      return getPopBurstStart(index);

    default:
      return getNeutralCenterStart(index);
  }
};

export const getCardShuffleStyle = (preset: CardDealPreset, index: number) => {
  switch (preset) {
    case "classicSpin":
      return getClassicShuffle(index);

    case "tornadoDeal":
      return getTornadoShuffle(index);

    case "waveDeal":
      return getWaveShuffle(index);

    case "orbitDeal":
      return getOrbitShuffle(index);

    case "popBurstDeal":
      return getPopBurstShuffle(index);

    default:
      return getClassicShuffle(index);
  }
};

/**
 * All cards finish exactly at DEALING_SPIN_MS.
 *
 * Example when DEALING_SPIN_MS = 7000:
 * Card 0: delay 0ms, duration 7000ms
 * Card 1: delay 80ms, duration 6920ms
 * Card 2: delay 160ms, duration 6840ms
 * Card 3: delay 240ms, duration 6760ms
 */
export const getCardDealTransition = (
  _preset: CardDealPreset,
  index: number,
) => {
  const delay = index * 80;

  return {
    type: "timing" as const,
    duration: DEALING_SPIN_MS - delay,
    delay,
  };
};

type GridCardMotionInput = {
  index: number;
  roles: string[];
  invisibleIndices: number[];
  gamePhase: string;
  dealingStage: DealingStage;
  dealAnimationPreset: CardDealPreset;
};

export const getGridCardMotion = ({
  index,
  roles,
  invisibleIndices,
  gamePhase,
  dealingStage,
  dealAnimationPreset,
}: GridCardMotionInput) => {
  const role = roles[index];
  const isPublicRole = role === "King" || role === "Police";

  const shouldHideOriginalCard =
    invisibleIndices.includes(index) &&
    (gamePhase === "investigation_shuffle" || gamePhase === "police_turn");

  if (dealingStage === "spin") {
    return {
      animate: getCardShuffleStyle(dealAnimationPreset, index),
      transition: getCardDealTransition(dealAnimationPreset, index),
      zIndex: 100,
    };
  }

  if (dealingStage === "fade") {
    if (!isPublicRole) {
      return {
        animate: {
          opacity: 0,
          scale: 0.75,
          translateX: 0,
          translateY: 0,
          rotate: index % 2 === 0 ? "-12deg" : "12deg",
        },
        transition: {
          type: "timing" as const,
          duration: DEALING_SPIN_MS - FADE_START_MS,
        },
        zIndex: 1,
      };
    }

    return {
      animate: {
        opacity: 1,
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotate: "0deg",
      },
      transition: {
        type: "spring" as const,
        damping: 14,
        stiffness: 110,
      },
      zIndex: 10,
    };
  }

  if (dealingStage === "reveal" && isPublicRole) {
    const revealPlacement = getOfflineRevealPlacement(index, role);

    return {
      animate: {
        opacity: 1,
        scale: 1.03,
        translateX: revealPlacement.translateX,
        translateY: revealPlacement.translateY,
        rotate: "0deg",
      },
      transition: {
        type: "spring" as const,
        damping: 14,
        stiffness: 95,
      },
      zIndex: revealPlacement.zIndex,
    };
  }

  if (dealingStage === "reveal") {
    return {
      animate: {
        opacity: 0,
        scale: 0.8,
        translateX: 0,
        translateY: 0,
        rotate: index % 2 === 0 ? "-10deg" : "10deg",
      },
      transition: {
        type: "timing" as const,
        duration: 420,
      },
      zIndex: 1,
    };
  }

  return {
    animate: {
      opacity: shouldHideOriginalCard ? 0 : 1,
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotate: "0deg",
    },
    transition: {
      type: "spring" as const,
      damping: 16,
      stiffness: 90,
    },
    zIndex: shouldHideOriginalCard ? 0 : 1,
  };
};

// classicSpin  -> center spinning deck
// tornadoDeal  -> outward 360° deal
// waveDeal     -> opposite-side throw deal
// orbitDeal    -> 540° orbit deal
// popBurstDeal -> reverse vortex burst
