import { CardDealPreset } from "@/redux/reducers/sessionSlice";
import { hp, wp } from "@/utils/responsive";

import { DEALING_SPIN_MS, FADE_START_MS } from "../constants";
import { DealingStage } from "../types";

export const getNeutralCenterStart = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;

  return {
    translateX: isLeft ? wp(23) : -wp(23),
    translateY: isTop ? hp(12) : -hp(12),
    rotate: "0deg",
    scale: 1,
    opacity: 0,
  };
};

export const getClassicShuffle = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;

  return {
    translateX: isLeft ? wp(23) : -wp(23),
    translateY: isTop ? hp(12) : -hp(12),
    rotate: "1080deg",
    scale: 1,
    opacity: 1,
  };
};

export const getTornadoShuffle = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;

  return {
    translateX: (isLeft ? wp(23) : -wp(23)) + (index % 2 === 0 ? 2 : -2),
    translateY: (isTop ? hp(12) : -hp(12)) + (index < 2 ? 2 : -2),
    rotate: "1440deg",
    scale: 0.9,
    opacity: 1,
  };
};

export const getWaveStart = (index: number) => {
  const startPos =
    [
      { x: -wp(100), y: 0 },
      { x: wp(100), y: 0 },
      { x: 0, y: -hp(50) },
      { x: 0, y: hp(50) },
    ][index] ?? { x: 0, y: 0 };

  return {
    translateX: startPos.x,
    translateY: startPos.y,
    rotate: "45deg",
    scale: 0.8,
    opacity: 0,
  };
};

export const getWaveShuffle = () => ({
  translateX: 0,
  translateY: 0,
  rotate: "0deg",
  scale: 1,
  opacity: 1,
});

export const getOrbitStart = (index: number) => {
  const angle = (index * Math.PI) / 2;
  const radius = wp(50);

  return {
    translateX: Math.cos(angle) * radius,
    translateY: Math.sin(angle) * radius,
    rotate: `${index * 90}deg`,
    scale: 0.5,
    opacity: 0,
  };
};

export const getOrbitShuffle = (index: number) => {
  const angle = (index * Math.PI) / 2;
  const radius = wp(10);

  return {
    translateX: Math.cos(angle) * radius,
    translateY: Math.sin(angle) * radius,
    rotate: `${index * 180 + 360}deg`,
    scale: 1,
    opacity: 1,
  };
};

export const getPopBurstStart = (_index: number) => ({
  translateX: 0,
  translateY: 0,
  rotate: "0deg",
  scale: 0.01,
  opacity: 0,
});

export const getPopBurstShuffle = (index: number) => ({
  translateX: index % 2 === 0 ? 10 : -10,
  translateY: index < 2 ? 10 : -10,
  rotate: `${(index - 1.5) * 20}deg`,
  scale: 1.1,
  opacity: 1,
});

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
      return getWaveShuffle();
    case "orbitDeal":
      return getOrbitShuffle(index);
    case "popBurstDeal":
      return getPopBurstShuffle(index);
    default:
      return getClassicShuffle(index);
  }
};

export const getCardDealTransition = (
  preset: CardDealPreset,
  index: number,
) => {
  if (preset === "waveDeal") {
    return {
      type: "timing" as const,
      duration: DEALING_SPIN_MS,
      delay: index * 120,
    };
  }

  if (preset === "popBurstDeal") {
    return {
      type: "spring" as const,
      damping: 12,
      stiffness: 120,
      delay: index * 80,
    };
  }

  return {
    type: "timing" as const,
    duration: DEALING_SPIN_MS,
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
          rotate: "0deg",
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
      transition: { type: "spring" as const, damping: 18, stiffness: 100 },
      zIndex: 10,
    };
  }

  if (dealingStage === "reveal" && isPublicRole) {
    const revealPlacement = getOfflineRevealPlacement(index, role);

    return {
      animate: {
        opacity: 1,
        scale: 1,
        translateX: revealPlacement.translateX,
        translateY: revealPlacement.translateY,
        rotate: "0deg",
      },
      transition: {
        type: "spring" as const,
        damping: 16,
        stiffness: 90,
      },
      zIndex: revealPlacement.zIndex,
    };
  }

  if (dealingStage === "reveal") {
    return {
      animate: {
        opacity: 0,
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotate: "0deg",
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
