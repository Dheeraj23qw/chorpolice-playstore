// flipCardUtil.ts
import { Animated } from "react-native";
import { Dispatch, SetStateAction } from "react";
import { playSound } from "@/redux/reducers/soundReducer";
import { AppDispatch } from "@/redux/store";
export const flipCard = (
  index: number,
  toValue: number,
  duration: number,
  flipAnims: Animated.Value[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>,
  flippedStates: boolean[],
  roles: string[],
  clickedCards: boolean[],
  setRound: Dispatch<SetStateAction<number>>,
  resetForNextRound: () => void,
  dispatch:AppDispatch,
  
) => {

  dispatch(playSound("spin"));

  Animated.timing(flipAnims[index], {
    toValue,
    duration,
    useNativeDriver: true,
  }).start(() => {
    // Update the flipped state
    setFlippedStates((prev) => {
      const newFlippedStates = [...prev];
      newFlippedStates[index] = toValue === 1; // Flip state
      return newFlippedStates;
    });

    const allNonPoliceFlipped = flippedStates.every(
      (flipped, idx) =>
        roles[idx] === "Police" || clickedCards[idx] || index === idx
    );

    if (allNonPoliceFlipped) {
      setRound((prevRound) => prevRound + 1);
      setTimeout(() => {
        resetForNextRound();
      }, 8000);
    }
  });
};
