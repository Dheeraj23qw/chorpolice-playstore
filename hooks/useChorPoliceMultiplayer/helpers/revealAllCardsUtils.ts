// revealCardsUtil.ts
import { Animated } from "react-native";
import { Dispatch, SetStateAction } from "react";
import { AppDispatch } from "@/redux/store";

import { flipCard } from "../../useChorPoliceMultiplayer/helpers/flipCardUtil";

/**
 * Flips all unflipped cards and returns the timer ID.
 * FIX BUG-9: return the timer so the call site can track it in timerRefs
 * and clear it on unmount — prevents state update on unmounted component.
 */
export const revealAllCards = (
  roles: string[],
  flippedStates: boolean[],
  flipAnims: Animated.Value[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>,
  clickedCards: boolean[],
  setRound: Dispatch<SetStateAction<number>>,
  resetForNextRound: () => void,
  dispatch: AppDispatch,
): ReturnType<typeof setTimeout> => {
  return setTimeout(() => {
    roles.forEach((_, index) => {
      if (!flippedStates[index]) {
        flipCard(
          index,
          1,
          2000,
          flipAnims,
          setFlippedStates,
          flippedStates,
          roles,
          clickedCards,
          setRound,
          resetForNextRound,
          dispatch,
        );
      }
    });
  }, 100);
};
