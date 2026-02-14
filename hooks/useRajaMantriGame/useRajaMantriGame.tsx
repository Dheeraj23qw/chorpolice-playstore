import { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { resetGame } from "./utils/resetGameUtils";
import { flipCard } from "./utils/flipCardUtil";
import { revealAllCards } from "./utils/revealAllCardsUtils";
import { resetForNextRound } from "./utils/resetForNextRound";
import { handlePlayHelper } from "./gameHelper/handleplay";
import { updateScoreUtil } from "./utils/updateScoreUtil";
import { RootState } from "@/redux/store";
import useRandomMessage from "../useRandomMessage";
import { updatePlayerScores } from "@/redux/reducers/playerReducer";
import { resetGamefromRedux } from "@/redux/reducers/playerReducer";
import { resetDifficulty } from "@/redux/reducers/quiz";
import { AudioEngine } from "@/audio/audioEngine";
import { useTimeoutManager } from "../useTimeOutManager";
interface UseRajaMantriGameOptions {
  playerNames: string[];
}
interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
  name?: string | null;
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
      scores: [],
    })),
  );
  const [round, setRound] = useState<number>(1);
  const [videoIndex, setVideoIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [areCardsClickable, setAreCardsClickable] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [firstCardClicked, setFirstCardClicked] = useState<boolean>(false);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif" | null>(
    null,
  );
  const [showTableButton, setShowTableButton] = useState(false);

  const [playerData, setPlayerData] = useState<PlayerData>({
    image: null,
    message: null,
    imageType: null,
    name:null,
  });
  const [isRoundStartPopupVisible, setIsRoundStartPopupVisible] =
    useState(false);
  const [roundStartMessage, setRoundStartMessage] = useState("");

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const playerNamesRedux = useSelector(
    (state: RootState) => state.player.playerNames,
  );

  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound,
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset,
  );

  const isLocked = isGameReset;

  const { safeSetTimeout, clearAllTimeouts } = useTimeoutManager(isLocked);

  useEffect(() => {
    if (!isGameReset) return;

    clearAllTimeouts();
    AudioEngine.stopAllExceptQuiz();
    handleResetgame();
    router.replace("/mode-select");
  }, [isGameReset]);

  useEffect(() => {
    handleResetgame();
  }, []);

  const handleExitGame = async () => {
    try {
      handleResetgame();

      AudioEngine.stopAllExceptQuiz();

      dispatch(resetGamefromRedux());
      dispatch(resetDifficulty());

      if (router.canGoBack()) {
        router.dismissAll();
      }

      safeSetTimeout(() => {
        router.replace("/mode-select");
      }, 500);
    } catch (error) {
      console.error("Exit failed:", error);
      router.replace("/");
    }
  };

  const handleResetgame = () => {
    setShowTableButton(false);
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
      setPlayerScores,
      setPolicePlayerName,
      setPlayerData,
      setIsModalVisible,
      setPopupIndex,
      setMediaId,
      setMediaType,
      setFirstCardClicked,
      setIsDynamicPopUp,
    );
  };

const policeName =
  policeIndex !== null && policeIndex >= 0
    ? playerNamesRedux[policeIndex]?.name || ""
    : "";

const randomMessageWin = useRandomMessage("win", policeName);
const randomMessageLose = useRandomMessage("lose", policeName);


  const handlesetRoundStartMessage = () => {
    if (isLocked) return;
    setRoundStartMessage("Round " + round + " starts!");
    setIsRoundStartPopupVisible(true);
    safeSetTimeout(() => {
      setIsRoundStartPopupVisible(false);
    }, 3000);
  };

  const handlePlay = () => {
    if (isLocked) return;
    setShowTableButton(true);
    handlesetRoundStartMessage();

    safeSetTimeout(() => {
      AudioEngine.play("select", "ui");

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
        setAreCardsClickable,
        setRound,
        resetForNextRoundHandler,
        flipAnims,
        flippedStates,
        roles,
        clickedCards,
        setFlippedStates,
        setPopupIndex,
      );
    }, 1000);
  };

  const updateScore = (
    playerIndex: number,
    newScore: number,
    roundIndex: number,
  ) => {
    if (isLocked) return;
    setPlayerScores((prevScores) =>
      updateScoreUtil(prevScores, playerIndex, newScore, roundIndex),
    );
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    AudioEngine.play("select", "ui");

    if (
      !areCardsClickable ||
      !isPlayButtonDisabled ||
      flippedStates[index] ||
      clickedCards[index]
    ) {
      return;
    }

    if (firstCardClicked) {
      return;
    }

    setFirstCardClicked(true);
    if (
      isPlayButtonDisabled &&
      thiefIndex !== null &&
      policeIndex !== null &&
      advisorIndex !== null &&
      kingIndex !== null
    ) {
      const playerRole = roles[index];
      const currentPlayerImage = playerImages[selectedImages[policeIndex]]?.src;
      const currentPlayerImageType =playerImages[selectedImages[policeIndex]]?.type;
      const currentPlayerName = playerNamesRedux[policeIndex]?.name || "";

      if (playerRole === "Thief" && thiefIndex !== null) {
        if (isLocked) return;
        handleRevealAllCards();

        safeSetTimeout(() => {
          AudioEngine.play("win", "gameplay");
        }, 2000);

        safeSetTimeout(() => {
          setMediaType("gif");
          setIsDynamicPopUp(true);
          setMediaId(4);

          setPlayerData({
            image: currentPlayerImage,
            message: randomMessageWin,
            imageType: currentPlayerImageType,
            name: currentPlayerName,
          });
        }, 5000);

        updateScore(thiefIndex, 0, round - 1);
        updateScore(policeIndex, 500, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        safeSetTimeout(() => resetForNextRoundHandler(), 8000);
      } else {
        if (isLocked) return;
        handleRevealAllCards();

        safeSetTimeout(() => {
          AudioEngine.play("lose", "gameplay");
        }, 2000);

        safeSetTimeout(() => {
          setMediaType("gif");
          setIsDynamicPopUp(true);
          setMediaId(3);
          setPlayerData({
            image: currentPlayerImage,
            message: randomMessageLose,
            imageType: currentPlayerImageType,
            name: currentPlayerName,
          });
        }, 5000);

        updateScore(thiefIndex, 500, round - 1);
        updateScore(policeIndex, 0, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        safeSetTimeout(() => resetForNextRoundHandler(), 8000);
      }

      if (
        !flippedStates[index] &&
        roles[index] !== "Police" &&
        !clickedCards[index]
      ) {
        flipCard(
          index,
          1,
          1500,
          flipAnims,
          setFlippedStates,
          flippedStates,
          roles,
          clickedCards,
          setRound,
          resetForNextRoundHandler,
          dispatch,
        );
        setClickedCards((prev) => {
          const newClickedCards = [...prev];
          newClickedCards[index] = true;
          return newClickedCards;
        });
      } else if (flippedStates[index] && roles[index] !== "Police") {
        if (isLocked) return;
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
          dispatch,
        );
        setClickedCards((prev) => {
          const newClickedCards = [...prev];
          newClickedCards[index] = true;
          return newClickedCards;
        });
      }
    }
  };

  const handleRevealAllCards = () => {
    if (isLocked) return;
    revealAllCards(
      roles,
      flippedStates,
      flipAnims,
      setFlippedStates,
      clickedCards,
      setRound,
      resetForNextRoundHandler,
      dispatch,
    );
  };

  const calculateTotalScores = () => {
    if (isLocked) return;

    setPlayerScores((prevScores) => {
      const updatedScores = prevScores.map((player) => {
        const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
        return {
          ...player,
          totalScore,
        };
      });

      const totalScoresArray = updatedScores.map((player) => ({
        playerName: player.playerName,
        totalScore: player.totalScore,
      }));

      safeSetTimeout(() => {
        dispatch(updatePlayerScores(totalScoresArray));
      }, 500);

      return updatedScores;
    });
  };

  const resetForNextRoundHandler = () => {
    if (isLocked) return;
    setShowTableButton(false);
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
      router,
      setFirstCardClicked,
      setAreCardsClickable,
      setIsDynamicPopUp,
      setMediaId,
      setMediaType,
      selectedRounds,
      setPopupIndex,
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

    setIsPlaying,

    resetGame,
    resetForNextRound,
    handlePlay,
    handleCardClick,
    updateScore,
    handleExitGame,

    isModalVisible,
    popupIndex,
    isDynamicPopUp,
    mediaId,
    mediaType,
    playerData,
    isRoundStartPopupVisible,
    roundStartMessage,
    playerNamesRedux,

    handleResetgame,
    setPopupIndex,
    setIsDynamicPopUp,

    isGameReset,
    showTableButton,
    setShowTableButton,
    
  };
};

export default useRajaMantriGame;
