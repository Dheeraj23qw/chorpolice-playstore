import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { updatePlayerScores, resetGame } from "@/redux/reducers/playerReducer";
import { BackHandler } from "react-native";
import { playSound } from "@/redux/reducers/soundReducer";
import useRandomMessage from "@/hooks/useRandomMessage";
import { setIsThinking } from "@/redux/reducers/botReducer";

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
  const [isBotThinking, setIsBotThinking] = useState(false);
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
    let timeoutToShow: NodeJS.Timeout | undefined;
    let timeoutToHide: NodeJS.Timeout | undefined;
    let timeoutToAnswer: NodeJS.Timeout | undefined;
  
    if (currentPlayerIsBot && !isPopUp) {
      // Delay showing the "bot is thinking" modal by 2 seconds
      timeoutToShow = setTimeout(() => {
        setIsBotThinking(true);
  
        // Automatically hide the modal after 3 seconds
        timeoutToHide = setTimeout(() => {
          setIsBotThinking(false);
  
          // Simulate the bot's answer after the modal disappears
          timeoutToAnswer = setTimeout(() => {
            simulateBotOptionSelection();
          }, 3000); // Delay bot's answer by 1 second after modal disappears
        }, 6000); // Show "bot is thinking" for 3 seconds
      }, 4000); // Initial delay before showing "bot is thinking"
    } else {
      setIsBotThinking(false); // Ensure modal is hidden for non-bot players
    }
  
    // Cleanup timeouts on unmount or when dependencies change
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
    const minDelay = 4000; // Minimum delay of 1 seconds
    const maxDelay = 6000; // Maximum delay of 3 seconds
    const randomDelay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay; // Random delay between 2000 and 6000

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
          router.push("/chorpoliceResult");
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

  };
};

export default useQuizLogic;
