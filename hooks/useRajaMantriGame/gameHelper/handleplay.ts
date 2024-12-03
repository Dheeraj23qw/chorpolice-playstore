import { playSound } from "@/redux/reducers/soundReducer";
import { AppDispatch } from "@/redux/store";
import { shuffleArray } from "../utils/suffleArrayUtils";
import { Dispatch, SetStateAction } from "react";
import { PlayerState } from "@/types/redux/reducers";
import { setIsThinking } from "@/redux/reducers/botReducer";

export const handlePlayHelper = (
  dispatch: AppDispatch,
  playerNames: string[],
  setSelectedPlayer: Dispatch<SetStateAction<number>>,
  setIsPlayButtonDisabled: Dispatch<SetStateAction<boolean>>,
  setRoles: Dispatch<SetStateAction<string[]>>,
  setPoliceIndex: Dispatch<SetStateAction<number | null>>,
  setKingIndex: Dispatch<SetStateAction<number | null>>,
  setAdvisorIndex: Dispatch<SetStateAction<number | null>>,
  setThiefIndex: Dispatch<SetStateAction<number | null>>,
  setPolicePlayerName: Dispatch<SetStateAction<string | null>>,
  flipCard: Function,
  setAreCardsClickable: Dispatch<SetStateAction<boolean>>,
  setRound: Dispatch<SetStateAction<number>>,
  resetForNextRoundHandler: Function,
  flipAnims: any,
  flippedStates: boolean[],
  roles: string[],
  clickedCards: boolean[],
  setFlippedStates: Dispatch<SetStateAction<boolean[]>>,
  setPopupIndex: Dispatch<SetStateAction<number | null>>,
  playerInfo: PlayerState
) => {
  try {
    const botIndexes = playerInfo.playerNames
      .map((player, idx) => (player.isBot ? idx : -1))
      .filter((idx) => idx !== -1);

    dispatch(playSound("level"));

    if (playerNames.length > 0) {
      const randomIndex = Math.floor(Math.random() * playerNames.length);
      setSelectedPlayer(randomIndex + 1);
      setIsPlayButtonDisabled(true);
    }

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

    const policePlayerName = policeIndex !== -1 ? playerNames[policeIndex] : null;
    setPolicePlayerName(policePlayerName);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      try {
        if (kingIndex !== -1 && policeIndex !== -1) {
          await Promise.all([
            flipCard(kingIndex, 1, 4000, flipAnims, setFlippedStates, flippedStates, roles, clickedCards, setRound, resetForNextRoundHandler, dispatch),
            flipCard(policeIndex, 1, 4000, flipAnims, setFlippedStates, flippedStates, roles, clickedCards, setRound, resetForNextRoundHandler, dispatch),
          ]);

          await delay(4500);
          setPopupIndex(2);
          dispatch(playSound("police"));
          await delay(4000);
          setPopupIndex(1);
          dispatch(playSound("king"));

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
