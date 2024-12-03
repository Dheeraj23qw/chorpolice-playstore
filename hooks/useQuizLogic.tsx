import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { updatePlayerScores } from "@/redux/reducers/playerReducer";
import { BackHandler } from "react-native";
import { playSound } from "@/redux/reducers/soundReducer";
import useRandomMessage from "@/hooks/useRandomMessage";

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
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isOptionDisabled, setIsOptionDisabled] = useState(false);
  const [isPopUp, setIsPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">(
    "image"
  );

  const currentPlayerName = playerNames[currentPlayerIndex]?.name;
  const winMessage = useRandomMessage(currentPlayerName, "win");
  const loseMessage = useRandomMessage(currentPlayerName, "lose");
  const thinkingMessage = useRandomMessage(currentPlayerName, "thinking");

  const [isBotThinking, setIsBotThinking] = useState(false);
  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    generateOptionsForPlayer();
  }, [currentPlayerIndex]);

  useEffect(() => {
    let timeoutToShow: NodeJS.Timeout | undefined;
    let timeoutToHide: NodeJS.Timeout | undefined;
    let timeoutToAnswer: NodeJS.Timeout | undefined;

    if (currentPlayerIsBot && !isPopUp) {
      timeoutToShow = setTimeout(() => {
        setIsBotThinking(true);
        timeoutToHide = setTimeout(() => {
          setIsBotThinking(false);

          timeoutToAnswer = setTimeout(() => {
            simulateBotOptionSelection();
          }, 3000);
        }, 6000);
      }, 4000);
    } else {
      setIsBotThinking(false);
    }

    return () => {
      if (timeoutToShow) clearTimeout(timeoutToShow);
      if (timeoutToHide) clearTimeout(timeoutToHide);
      if (timeoutToAnswer) clearTimeout(timeoutToAnswer);
    };
  }, [currentPlayerIndex, isPopUp]);

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
      setIsPopUp(true);
      setMediaId(2);
      setMediaType("gif");
      setFeedback(winMessage, "win"); // Pass win message here
    } else {
      updateScore(currentPlayerName, -2000);
      setIsPopUp(true);
      setMediaId(1);
      setMediaType("gif");
      setFeedback(loseMessage, "lose"); // Pass lose message here
    }
  };

  const simulateBotOptionSelection = () => {
    const minDelay = 1000; // Minimum delay of 1 second
    const maxDelay = 2000; // Maximum delay of 2 seconds
    const randomDelay =
        Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay; // Random delay

    setTimeout(() => {
        const correctScore = playerScores.find(
            (score) => score.playerName === currentPlayerName
        )?.totalScore ?? 0;

        // 50% chance to select the correct answer
        if (Math.random() < 0.5) {
            handleOptionPress(correctScore); // Select the correct answer
        } else {
            // Select a random incorrect answer
            const incorrectOptions = options.filter(option => option !== correctScore);
            const botChoice =
                incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
            handleOptionPress(botChoice);
        }
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

  const setFeedback = (message: string, soundName: "win" | "lose") => {
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
    setIsPopUp(false);
    setMediaId(1);
    setMediaType("image");

    setCurrentPlayerIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < playerNames.length) {
        return nextIndex;
      } else {
        setTimeout(() => {
          router.replace("/chorpoliceResult");
        }, 1);
        return prevIndex;
      }
    });
  };

  const currentPlayer = playerNames[currentPlayerIndex] || {};
  const playerImage =
    playerImages[selectedImages[currentPlayerIndex]] ?? playerImages[0];

  const currentPlayerImage =
    playerImages[selectedImages[currentPlayerIndex]]?.src;
  const currentPlayerImageType =
    playerImages[selectedImages[currentPlayerIndex]]?.type;

  return {
    currentPlayer,
    playerImage,
    feedbackMessage,
    options,
    isContentVisible,
    handleOptionPress,
    moveToNextPlayer,
    isOptionDisabled,
    currentPlayerIsBot,
    isPopUp,
    mediaType,
    mediaId,
    currentPlayerImage,
    currentPlayerName,
    currentPlayerImageType,
    playerNames,
    playerScores,
    isBotThinking,
    thinkingMessage,
  };
};

export default useQuizLogic;
