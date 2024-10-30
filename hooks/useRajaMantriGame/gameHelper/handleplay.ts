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
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean>>,
  setRound: React.Dispatch<React.SetStateAction<number>>,
  resetForNextRoundHandler: Function,
  flipAnims: any,
  flippedStates: boolean[],
  roles: string[],
  clickedCards: boolean[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>
) => {
  dispatch(playSound("level"));

  const randomIndex = Math.floor(Math.random() * 4);
  setSelectedPlayer(randomIndex + 1);
  setIsPlayButtonDisabled(true);
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

  // Set player names for Police and King
  const policePlayerName = policeIndex !== -1 ? playerNames[policeIndex] : null;
  setPolicePlayerName(policePlayerName);

  if (kingIndex !== -1) {
    flipCard(
      kingIndex,
      1,
      4000,
      flipAnims,
      setFlippedStates,
      flippedStates,
      roles,
      clickedCards,
      setRound,
      resetForNextRoundHandler,
      dispatch
    );
    setTimeout(() => {
      setMessage(`${policePlayerName},catch the thief`);
      setTimeout(() => setMessage(""), 12000);
    }, 3700);
  }

  setAreCardsClickable(false);

  if (policeIndex !== -1) {
    setTimeout(() => {
      flipCard(
        policeIndex,
        1,
        3700,
        flipAnims,
        setFlippedStates,
        flippedStates,
        roles,
        clickedCards,
        setRound,
        resetForNextRoundHandler,
        dispatch
      );

      setTimeout(() => setAreCardsClickable(true), 3300);
    }, 2000);
  }
};
