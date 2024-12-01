import { playSound } from "@/redux/reducers/soundReducer";
import { AppDispatch } from "@/redux/store";
import { shuffleArray } from "../utils/suffleArrayUtils";
import { Dispatch, SetStateAction } from "react";
import { PlayerState } from "@/types/redux/reducers";
import { setIsThinking } from "@/redux/reducers/botReducer";

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
  playerInfo: PlayerState
) => {
  try {
    const botIndexes = playerInfo.playerNames
      .map((player, idx) => (player.isBot ? idx : -1))
      .filter((idx) => idx !== -1);

    // Play the sound at the start of the turn
    dispatch(playSound("level"));

    // Select a random player and disable the play button
    if (playerNames.length > 0) {
      const randomIndex = Math.floor(Math.random() * playerNames.length);
      setSelectedPlayer(randomIndex + 1);
      setIsPlayButtonDisabled(true);
    }

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
    const policePlayerName =
      policeIndex !== -1 ? playerNames[policeIndex] : null;
    setPolicePlayerName(policePlayerName);

    // Sequentially execute actions for King and Police card flip and popups
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      try {
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
          await delay(4500);

          // Display popups and sounds
          setPopupIndex(2);
          dispatch(playSound("police"));
          await delay(4000);

          setPopupIndex(1);
          dispatch(playSound("king")); 

          // Bot thinking state
          if (policeIndex !== null && botIndexes.includes(policeIndex)) {
            await delay(4000);
            dispatch(setIsThinking(true));
          }

          setAreCardsClickable(true);
        } else {
          setAreCardsClickable(true);
        }
      } catch (error) {
        console.error("Error during async game sequence:", error);
      }
    })();
  } catch (error) {
    console.error("Error in handlePlayHelper:", error);
  }
};
