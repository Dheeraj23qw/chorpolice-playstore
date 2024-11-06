import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { updatePlayerScores, resetGame } from "@/redux/slices/playerSlice";
import { BackHandler } from "react-native";
import { playSound } from "@/redux/slices/soundSlice";

const useQuizLogic = (router: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages
  );
  const playerNames = useSelector(
    (state: RootState) => state.player.playerNames
  );
  const playerScores = useSelector(
    (state: RootState) => state.player.playerScores
  );
  const playerImages = useSelector((state: RootState) => state.playerImages.images);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isOptionDisabled, setIsOptionDisabled] = useState(false);

  // Handle the hardware back button press (Android)
  useEffect(() => {
    const backAction = () => {
      // Prevent default behavior (going back)
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    generateOptionsForPlayer();
  }, [currentPlayerIndex]);

  useEffect(() => {
    if (currentPlayerIsBot) {
      simulateBotOptionSelection();
    }
  }, [currentPlayerIndex]);

  const currentPlayerIsBot = playerNames[currentPlayerIndex]?.isBot;

  const generateOptionsForPlayer = () => {
    if (playerNames.length === 0) return;

    const currentPlayerName = playerNames[currentPlayerIndex]?.name;
    const correctScore =
      playerScores.find((score) => score.playerName === currentPlayerName)
        ?.totalScore ?? 0;

    const generateRandomScore = (baseScore: number) => {
      const variations = [500, 800];
      const variation =
        variations[Math.floor(Math.random() * variations.length)];
      return Math.max(
        0,
        baseScore + (Math.random() < 0.5 ? -variation : variation)
      );
    };

    const randomOptions = new Set<number>();
    randomOptions.add(correctScore);

    while (randomOptions.size < 3) {
      const randomScore = generateRandomScore(correctScore);
      if (!randomOptions.has(randomScore)) {
        randomOptions.add(randomScore);
      }
    }

    setOptions(Array.from(randomOptions).sort(() => Math.random() - 0.5));
  };

  const handleOptionPress = (score: number) => {
    if (isOptionDisabled) return;
    
    setIsOptionDisabled(true);

    const currentPlayerName = playerNames[currentPlayerIndex].name;
    const correctScore =
      playerScores.find((score) => score.playerName === currentPlayerName)
        ?.totalScore ?? 0;

    setSelectedOption(score);
    if (score === correctScore) {
      updateScore(currentPlayerName, 2000);
      setFeedback(true, "2000 points added!", "win");
    } else {
      updateScore(currentPlayerName, -2000);
      setFeedback(false, "2000 points deducted!", "lose");
    }
  };

  const simulateBotOptionSelection = () => {
    const minDelay = 2000; // Minimum delay of 2 seconds
    const maxDelay = 6000; // Maximum delay of 6 seconds
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay; // Random delay between 2000 and 6000
  
    setTimeout(() => {
      const botChoice = options[Math.floor(Math.random() * options.length)];
      handleOptionPress(botChoice);
    }, randomDelay);
  };

  const updateScore = (playerName: string, points: number) => {
    dispatch(
      updatePlayerScores(
        playerScores.map((playerScore) =>
          playerScore.playerName === playerName
            ? {
                ...playerScore,
                totalScore: (playerScore.totalScore ?? 0) + points,
              }
            : playerScore
        )
      )
    );
  };

  const setFeedback = (
    isCorrectAnswer: boolean,
    message: string,
    soundName: "win" | "lose"
  ) => {
    setIsCorrect(isCorrectAnswer);
    setFeedbackMessage(message);
    dispatch(playSound(soundName));
    setIsContentVisible(false);
    setTimeout(() => {
      moveToNextPlayer();
    }, 4000);
  };

  const moveToNextPlayer = () => {
    setSelectedOption(null);
    setIsCorrect(false);
    setFeedbackMessage("");
    setIsContentVisible(true);
    setIsOptionDisabled(false);

    setCurrentPlayerIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < playerNames.length) {
        return nextIndex;
      } else {
        setTimeout(() => {
          router.push("/chorpoliceResult");
        }, 10);
        return prevIndex;
      }
    });
  };

  const currentPlayer = playerNames[currentPlayerIndex] || {};
  const playerImage =
    playerImages[selectedImages[currentPlayerIndex]] ?? playerImages[0];

  return {
    currentPlayer,
    playerImage,
    feedbackMessage,
    isCorrect,
    options,
    isContentVisible,
    handleOptionPress,
    moveToNextPlayer,
    isOptionDisabled,
    currentPlayerIsBot
  };
};

export default useQuizLogic;
