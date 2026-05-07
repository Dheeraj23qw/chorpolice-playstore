import { CardDealPreset } from "@/redux/reducers/sessionSlice";
import { hp, wp } from "@/utils/responsive";
import { DEALING_SPIN_MS } from "../constants";
import { DealingStage } from "../types";

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
  void preset;
  void index;

  return {
    translateX: 0,
    translateY: 0,
    rotate: "0deg",
    scale: 1,
    opacity: 1,
  };
};

export const getCardShuffleStyle = (preset: CardDealPreset, index: number) => {
  void preset;

  return {
    translateX: index % 2 === 0 ? 5 : -5,
    translateY: index < 2 ? 5 : -5,
    rotate: "1080deg",
    scale: 1,
    opacity: 1,
  };
};

export const getCardDealTransition = (
  _preset: CardDealPreset,
  _index: number,
) => {
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
        damping: 16,
        stiffness: 90,
      },
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

  if (dealingStage === "reveal" && !isPublicRole) {
    return {
      animate: {
        opacity: 0,
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
      zIndex: 1,
    };
  }

  // Final default state
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
