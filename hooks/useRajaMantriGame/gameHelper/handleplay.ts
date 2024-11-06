import { playSound } from "@/redux/slices/soundSlice";
import { AppDispatch } from "@/redux/store";
import { shuffleArray } from "../utils/suffleArrayUtils";
import { Dispatch, SetStateAction } from "react";

export const handlePlayHelper = (
  dispatch: AppDispatch,
  playerNames: string[],
  setSelectedPlayer: React.Dispatch<React.SetStateAction<number>>,
  setIsPlayButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>,
  setRoles: React.Dispatch<React.SetStateAction<string[]>>,
  setPoliceIndex: React.Dispatch<SetStateAction<number | null>>,
  setKingIndex: React.Dispatch<SetStateAction<number | null>>,
  setAdvisorIndex: React.Dispatch<SetStateAction<number | null>>,
  setThiefIndex: React.Dispatch<SetStateAction<number | null>>,
  setPolicePlayerName: React.Dispatch<React.SetStateAction<string | null>>,
  flipCard: Function,
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean>>,
  setRound: React.Dispatch<React.SetStateAction<number>>,
  resetForNextRoundHandler: Function,
  flipAnims: any,
  flippedStates: boolean[],
  roles: string[],
  clickedCards: boolean[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>,
  setPopupIndex:React.Dispatch<React.SetStateAction<number | null>>,

) => {
  dispatch(playSound("level"));

  const randomIndex = Math.floor(Math.random() * 4);
  setSelectedPlayer(randomIndex + 1);
  setIsPlayButtonDisabled(true);

  // Shuffle and assign roles
  const shuffledRoles = shuffleArray(["King", "Advisor", "Thief", "Police"]);
  setRoles(shuffledRoles);

  const policeIndex = shuffledRoles.indexOf("Police");
  const kingIndex = shuffledRoles.indexOf("King");
  const advisorIndex = shuffledRoles.indexOf("Advisor");
  const thiefIndex = shuffledRoles.indexOf("Thief");

  setPoliceIndex(policeIndex);
  setKingIndex(kingIndex);
  setAdvisorIndex(advisorIndex);
  setThiefIndex(thiefIndex);

  // Set player name for Police
  const policePlayerName = policeIndex !== -1 ? playerNames[policeIndex] : null;
  setPolicePlayerName(policePlayerName);

  // Flip both King and Police cards simultaneously
  if (kingIndex !== -1 && policeIndex !== -1) {
    flipCard(
      kingIndex,
      1,
      5000,
      flipAnims,
      setFlippedStates,
      flippedStates,
      roles,
      clickedCards,
      setRound,
      resetForNextRoundHandler,
      dispatch
    );

    flipCard(
      policeIndex,
      1,
      5000,
      flipAnims,
      setFlippedStates,
      flippedStates,
      roles,
      clickedCards,
      setRound,
      resetForNextRoundHandler,
      dispatch
    );

  // After the flip animation finishes (6 seconds), set popupIndex to 1
  setTimeout(() => {
    setPopupIndex(1);

    // After an additional 5 seconds, set popupIndex to 2
    setTimeout(() => {
      setPopupIndex(2);

      // After 6 seconds in total (flip + popup 2), make the cards clickable
      setTimeout(() => {
        setAreCardsClickable(true);
      }, 1000); // Short delay after popup 2
    }, 5200); // Delay for popup 2
  }, 6000); // Flip animation duration
  } else {
    setAreCardsClickable(true);
  }
};