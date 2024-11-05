// revealCardsUtil.ts
import { Animated } from "react-native";
import { Dispatch, SetStateAction } from "react";
import { AppDispatch } from "@/redux/store"; // Import your store type here

import { flipCard } from "./flipCardUtil";

export const revealAllCards = (
  roles: string[],
  flippedStates: boolean[],
  flipAnims: Animated.Value[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>,
  clickedCards: boolean[],
  setRound: Dispatch<SetStateAction<number>>,
  resetForNextRound: () => void,
  dispatch: AppDispatch // Add dispatch as a parameter
) => {
  setTimeout(() => {
    roles.forEach((_, index) => {
      if (!flippedStates[index]) {
        flipCard(
          index,
          1,
          4500,
          flipAnims,
          setFlippedStates,
          flippedStates,
          roles,
          clickedCards,
          setRound,
          resetForNextRound,
          dispatch
        );
      }
    });
  }, 100);
};
