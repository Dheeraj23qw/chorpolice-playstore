// flipCardUtil.ts
import { Animated } from "react-native";
import { Dispatch, SetStateAction } from "react";
import { AppDispatch } from "@/redux/store";
import { AudioEngine } from "@/audio/audioEngine";

/**
 * Flips a single card at `index` to `toValue` over `duration` ms.
 *
 * NOTE: Parameters `flippedStates`, `clickedCards`, `setRound`, and `resetForNextRound`
 * are kept for backward compatibility with existing call sites but are NOT used for
 * round progression logic. The ChorPoliceEngine handles round advancement exclusively.
 */
export const flipCard = (
  index: number,
  toValue: number,
  duration: number,
  flipAnims: Animated.Value[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>,
  _flippedStates: boolean[],
  _roles: string[],
  _clickedCards: boolean[],
  _setRound: Dispatch<SetStateAction<number>>,
  _resetForNextRound: () => void,
  _dispatch: AppDispatch,
) => {
  AudioEngine.play("spin", "gameplay");

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
  });
};

