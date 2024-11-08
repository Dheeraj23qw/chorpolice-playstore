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
  setPopupIndex: React.Dispatch<React.SetStateAction<number | null>>,
) => {
  // Play the sound at the start of the turn
  dispatch(playSound("level"));

  // Select a random player and disable the play button
  const randomIndex = Math.floor(Math.random() * playerNames.length);
  setSelectedPlayer(randomIndex + 1);
  setIsPlayButtonDisabled(true);

  // Shuffle roles and assign indices
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

  // Set the police player name
  const policePlayerName = policeIndex !== -1 ? playerNames[policeIndex] : null;
  setPolicePlayerName(policePlayerName);

  // Sequentially execute actions for King and Police card flip and popups
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  (async () => {
    // Flip King and Police cards simultaneously if they exist
    if (kingIndex !== -1 && policeIndex !== -1) {
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

      flipCard(
        policeIndex,
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

      // Wait for flip animations to complete
      await delay(5000);
      
      // Display popup 2
      setPopupIndex(2);
      dispatch(playSound("police"));

      // Wait for popup 2 display duration
      await delay(6000);
      
      // Display popup 1

      setPopupIndex(1);
      dispatch(playSound("king"));


      // Wait for popup 1 display duration
      await delay(5000);
      
      // Make the cards clickable after all animations and popups
      setAreCardsClickable(true);
    } else {
      // If King or Police index is not found, make cards clickable immediately
      setAreCardsClickable(true);
    }
  })();
};
