import { useState, useEffect } from "react";
import { Animated } from "react-native";
import { BackHandler } from "react-native";
import { useDispatch } from "react-redux";
import { updatePlayerScores } from "@/redux/slices/playerSlice";
import { useRouter, useNavigation } from "expo-router";
import { shuffleArray } from "./utils/suffleArrayUtils";
import { resetGame } from "./utils/resetGameUtils";
import { flipCard } from "./utils/flipCardUtil";

import {
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/slices/soundSlice";
import { revealAllCards } from "./utils/revealAllCards";
import { resetForNextRound } from "./utils/resetForNextRound";
import { handlePlayHelper } from "./gameHelper/handleplay";

interface UseRajaMantriGameOptions {
  playerNames: string[];
}

const useRajaMantriGame = ({ playerNames }: UseRajaMantriGameOptions) => {
  const initialFlippedStates = [false, false, false, false];
  const initialClickedCards = [false, false, false, false];
  const initialFlipAnims = Array(4).fill(new Animated.Value(0));

  const [flipAnims, setFlipAnims] =
    useState<Animated.Value[]>(initialFlipAnims);
  const [flippedStates, setFlippedStates] =
    useState<boolean[]>(initialFlippedStates);
  const [clickedCards, setClickedCards] =
    useState<boolean[]>(initialClickedCards);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(1);
  const [message, setMessage] = useState<string>("");
  const [roles, setRoles] = useState<string[]>([
    "King",
    "Advisor",
    "Thief",
    "Police",
  ]);
  const [isPlayButtonDisabled, setIsPlayButtonDisabled] =
    useState<boolean>(false);
  const [policeClickCount, setPoliceClickCount] = useState<number>(0);
  const [policePlayerName, setPolicePlayerName] = useState<string | null>(null);
  const [policeIndex, setPoliceIndex] = useState<number | null>(null);
  const [kingIndex, setKingIndex] = useState<number | null>(null);
  const [advisorIndex, setAdvisorIndex] = useState<number | null>(null);
  const [thiefIndex, setThiefIndex] = useState<number | null>(null);
  const [playerScores, setPlayerScores] = useState<
    Array<{ playerName: string; scores: number[] }>
  >(
    playerNames.map((name) => ({
      playerName: name,
      scores: Array.from({ length: 10 }, () => 0),
    }))
  );
  const [round, setRound] = useState<number>(1);
  const [videoIndex, setVideoIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [areCardsClickable, setAreCardsClickable] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleBackButton = () => {
      return true; // Prevent default behavior
    };

    const unsubscribe = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );
    return () => unsubscribe.remove();
  }, []);

  useEffect(() => {
    resetGame(
      initialFlippedStates,
      initialClickedCards,
      initialFlipAnims,
      playerNames,
      setFlipAnims,
      setFlippedStates,
      setClickedCards,
      setSelectedPlayer,
      setIsPlayButtonDisabled,
      setRound,
      setMessage,
      setPoliceClickCount,
      setAdvisorIndex,
      setThiefIndex,
      setKingIndex,
      setPoliceIndex,
      setVideoIndex,
      setIsPlaying,
      setPlayerScores
    );

    return () => {
      dispatch(stopQuizSound());
      dispatch(unloadSounds());
    };
  }, [dispatch]);

  const handlePlay = () => {
    handlePlayHelper(
      dispatch,
      playerNames,
      setSelectedPlayer,
      setIsPlayButtonDisabled,
      setRoles,
      setPoliceIndex,
      setKingIndex,
      setAdvisorIndex,
      setThiefIndex,
      setPolicePlayerName,
      flipCard,
      setMessage,
      setAreCardsClickable,
      setRound,
      resetForNextRoundHandler,
      flipAnims,
      flippedStates,
      roles,
      clickedCards,
      setFlippedStates
    );
  };

  const updateScore = (
    playerIndex: number,
    newScore: number,
    roundIndex: number
  ) => {
    setPlayerScores((prevScores) => {
      if (playerIndex >= 0 && playerIndex < prevScores.length) {
        const newPlayerScores = prevScores.map((player, index) => {
          if (index === playerIndex) {
            const updatedScores = [...player.scores];
            updatedScores[roundIndex] = newScore;

            return {
              ...player,
              scores: updatedScores,
            };
          } else {
            return player;
          }
        });

        return newPlayerScores;
      } else {
        return prevScores;
      }
    });
  };

  const handleCardClick = (index: number) => {
    if (
      !areCardsClickable ||
      !isPlayButtonDisabled ||
      flippedStates[index] ||
      clickedCards[index]
    ) {
      return;
    }

    if (
      isPlayButtonDisabled &&
      thiefIndex !== null &&
      policeIndex !== null &&
      advisorIndex !== null &&
      kingIndex !== null
    ) {
      const playerRole = roles[index];

      if (playerRole === "Thief" && thiefIndex !== null) {
        handleRevealAllCards();

        setTimeout(() => {
          setVideoIndex(2);
          setIsPlaying(true);
        }, 4000);

        updateScore(thiefIndex, 0, round - 1);
        updateScore(policeIndex, 500, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        setTimeout(() => resetForNextRoundHandler(), 7000);
        dispatch(playSound("win"));
      } else {
        handleRevealAllCards();
        setTimeout(() => {
          setVideoIndex(3);
          setIsPlaying(true);
        }, 4000);

        updateScore(thiefIndex, 500, round - 1);
        updateScore(policeIndex, 0, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        setTimeout(() => resetForNextRoundHandler(), 7000);
        dispatch(playSound("lose"));
      }

      if (
        !flippedStates[index] &&
        roles[index] !== "Police" &&
        !clickedCards[index]
      ) {
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
          resetForNextRoundHandler,
          dispatch
        );
        setClickedCards((prev) => {
          const newClickedCards = [...prev];
          newClickedCards[index] = true;
          return newClickedCards;
        });
      } else if (flippedStates[index] && roles[index] !== "Police") {
        flipCard(
          index,
          0,
          1500,
          flipAnims,
          setFlippedStates,
          flippedStates,
          roles,
          clickedCards,
          setRound,
          resetForNextRoundHandler,
          dispatch
        );
        setClickedCards((prev) => {
          const newClickedCards = [...prev];
          newClickedCards[index] = false;
          return newClickedCards;
        });
      }
    }
  };

  const handleRevealAllCards = () => {
    revealAllCards(
      roles,
      flippedStates,
      flipAnims,
      setFlippedStates,
      clickedCards,
      setRound,
      resetForNextRoundHandler,
      dispatch // Pass dispatch here
    );
  };

  const calculateTotalScores = () => {
    setPlayerScores((prevScores) => {
      const updatedScores = prevScores.map((player) => {
        const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
        return {
          ...player,
          totalScore,
        };
      });

      // Create an array with only player names and total scores
      const totalScoresArray = updatedScores.map((player) => ({
        playerName: player.playerName,
        totalScore: player.totalScore,
      }));

      // Dispatch the array with only player names and total scores to the store
      setTimeout(() => {
        dispatch(updatePlayerScores(totalScoresArray));
      }, 1000);

      return updatedScores;
    });
  };

  const resetForNextRoundHandler = () => {
    resetForNextRound(
      round,
      initialFlipAnims,
      initialFlippedStates,
      initialClickedCards,
      setRound,
      setFlipAnims,
      setFlippedStates,
      setClickedCards,
      setIsPlayButtonDisabled,
      setMessage,
      setPoliceClickCount,
      setAdvisorIndex,
      setThiefIndex,
      setKingIndex,
      setPoliceIndex,
      dispatch,
      calculateTotalScores,
      router // Pass router here
    );
  };

  return {
    flipAnims,
    flippedStates,
    clickedCards,
    selectedPlayer,
    message,
    roles,
    isPlayButtonDisabled,
    policeClickCount,
    policePlayerName,
    policeIndex,
    kingIndex,
    advisorIndex,
    thiefIndex,
    playerScores,
    round,
    videoIndex,
    isPlaying,
    handlePlay,
    setIsPlaying,
    handleCardClick,
    updateScore,
    resetGame,
    resetForNextRound,
    isModalVisible,
  };
};

export default useRajaMantriGame;
