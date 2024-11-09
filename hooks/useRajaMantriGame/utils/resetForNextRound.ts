import { Animated } from "react-native";
import { AppDispatch } from "@/redux/store";
import { playSound } from "@/redux/slices/soundSlice";
import { Router } from "expo-router";

export const resetForNextRound = (
  round: number,
  initialFlipAnims: Animated.Value[],
  initialFlippedStates: boolean[],
  initialClickedCards: boolean[],
  setRound: React.Dispatch<React.SetStateAction<number>>,
  setFlipAnims: React.Dispatch<React.SetStateAction<Animated.Value[]>>,
  setFlippedStates: React.Dispatch<React.SetStateAction<boolean[]>>,
  setClickedCards: React.Dispatch<React.SetStateAction<boolean[]>>,
  setIsPlayButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setPoliceClickCount: React.Dispatch<React.SetStateAction<number>>,
  setAdvisorIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setThiefIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setKingIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setPoliceIndex: React.Dispatch<React.SetStateAction<number | null>>,
  dispatch: AppDispatch,
  calculateTotalScores: () => void,
  router: Router,
  setFirstCardClicked: React.Dispatch<React.SetStateAction<boolean>>,
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (round == 1) {
    dispatch(playSound("next"));
    calculateTotalScores();
    setTimeout(() => {
      router.push("/chorPoliceQuiz");
    }, 2000); // Adding delay before navigating

    return;
  } else {

    setRound((count) => count + 1);
    setFlipAnims(initialFlipAnims.map(() => new Animated.Value(0)));
    setFlippedStates(initialFlippedStates);
    setClickedCards(initialClickedCards);
    setIsPlayButtonDisabled(false);
    setMessage("");
    setPoliceClickCount(0);
    setAdvisorIndex(null);
    setThiefIndex(null);
    setKingIndex(null);
    setPoliceIndex(null);
    setFirstCardClicked(false)
    setAreCardsClickable(false)
    dispatch(playSound("next"));

  }
};
