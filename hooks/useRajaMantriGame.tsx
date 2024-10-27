import { useState, useEffect } from "react";
import { Animated } from "react-native";
import { BackHandler } from "react-native";
import { useDispatch } from "react-redux";
import { updatePlayerScores } from "@/redux/slices/playerSlice";
import { useRouter, useNavigation } from "expo-router";


import {
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/slices/soundSlice";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [areCardsClickable, setAreCardsClickable] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    resetGame();
    return () => {
      dispatch(stopQuizSound());
      dispatch(unloadSounds());
    };
  }, [dispatch]);

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

  const navigation = useNavigation();

  const resetGame = () => {
    setFlipAnims(initialFlipAnims.map(() => new Animated.Value(0)));
    setFlippedStates(initialFlippedStates);
    setClickedCards(initialClickedCards);
    setSelectedPlayer(1);
    setIsPlayButtonDisabled(false);
    setRound(1);
    setMessage("");
    setPoliceClickCount(0);
    setAdvisorIndex(null);
    setThiefIndex(null);
    setKingIndex(null);
    setPoliceIndex(null);
    setVideoIndex(1);
    setIsPlaying(true);
    setPlayerScores(
      playerNames.map((name) => ({
        playerName: name,
        scores: Array.from({ length: 10 }, () => 0),
      }))
    );
  };

  const handlePlay = () => {
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
    const policePlayerName =
      policeIndex !== -1 ? playerNames[policeIndex] : null;
    setPolicePlayerName(policePlayerName);

    if (kingIndex !== -1) {
      flipCard(kingIndex, 1, 1800);
      setTimeout(() => {
        setMessage(`${policePlayerName},catch the thief`);
        setTimeout(() => setMessage(""), 7000);
      }, 1800);
    }

    setAreCardsClickable(false);

    if (policeIndex !== -1) {
      setTimeout(() => {
        flipCard(policeIndex, 1, 1800);

        setTimeout(() => setAreCardsClickable(true), 2000);
      }, 2000);
    }
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
        revealAllCards();

        setTimeout(() => {
          setVideoIndex(2);
          setIsPlaying(true);
        }, 3000);

        updateScore(thiefIndex, 0, round - 1);
        updateScore(policeIndex, 500, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        setTimeout(() => resetForNextRound(), 4000);
        dispatch(playSound("win"));
      } else {
        revealAllCards();

        setTimeout(() => {
          setVideoIndex(3);
          setIsPlaying(true);
        }, 3000);

        updateScore(thiefIndex, 500, round - 1);
        updateScore(policeIndex, 0, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        setTimeout(() => resetForNextRound(), 4000);
        dispatch(playSound("lose"));
      }

      if (
        !flippedStates[index] &&
        roles[index] !== "Police" &&
        !clickedCards[index]
      ) {
        flipCard(index, 1, 500);
        setClickedCards((prev) => {
          const newClickedCards = [...prev];
          newClickedCards[index] = true;
          return newClickedCards;
        });
      } else if (flippedStates[index] && roles[index] !== "Police") {
        flipCard(index, 0, 500);
        setClickedCards((prev) => {
          const newClickedCards = [...prev];
          newClickedCards[index] = false;
          return newClickedCards;
        });
      }
    }
  };

  const flipCard = (index: number, toValue: number, duration: number) => {

   
      dispatch(playSound("spin"));

    
    Animated.timing(flipAnims[index], {
      toValue,
      duration:2000,
      useNativeDriver: true,
    }).start(() => {
      setFlippedStates((prev) => {
        const newFlippedStates = [...prev];
        newFlippedStates[index] = toValue === 1;
        return newFlippedStates;
      });

      const allNonPoliceFlipped = [...flippedStates].every(
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

  const revealAllCards = () => {
    setTimeout(() => {
      roles.forEach((_, index) => {
        if (!flippedStates[index]) {
          flipCard(index, 1, 500);
        }
      });
    }, 100);
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

  const resetForNextRound = () => {
    if (round == 7) {
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
    }
  };

  function shuffleArray(array: string[]): string[] {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  }

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
