import { useState, useEffect } from "react";
import { Animated } from "react-native";
import { BackHandler } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { resetGame } from "./utils/resetGameUtils";
import { flipCard } from "./utils/flipCardUtil";
import { playSound } from "@/redux/reducers/soundReducer";
import { revealAllCards } from "./utils/revealAllCardsUtils";
import { resetForNextRound } from "./utils/resetForNextRound";
import { handlePlayHelper } from "./gameHelper/handleplay";
import { updateScoreUtil } from "./utils/updateScoreUtil";
import { RootState } from "@/redux/store";
import useRandomMessage from "../useRandomMessage";
import { updatePlayerScores } from "@/redux/reducers/playerReducer";
import * as Network from "expo-network";
import { resetGamefromRedux } from "@/redux/reducers/playerReducer";

interface UseRajaMantriGameOptions {
  playerNames: string[];
}
interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
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
    }))
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
    null
  );
  const [playerData, setPlayerData] = useState<PlayerData>({
    image: null,
    message: null,
    imageType: null,
  });
  const [isRoundStartPopupVisible, setIsRoundStartPopupVisible] =
    useState(false);
  const [roundStartMessage, setRoundStartMessage] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSearchScreenVisiable, setIsSearchScreenVisiable] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const gamemode = useSelector((state: RootState) => state.player.gameMode);

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages
  );
  const playerNamesRedux = useSelector(
    (state: RootState) => state.player.playerNames
  );
  const playerInfo = useSelector((state: RootState) => state.player);

  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound
  );

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    handleResetgame();
  }, []);

  const handleExitGame = () => {
    dispatch(resetGamefromRedux());
    handleResetgame();
    router.replace("/modeselect");
  };

  const toggleExitModal = () => setExitModalVisible(!exitModalVisible);

  const handleBackPress = () => {
    if (exitModalVisible) {
      toggleExitModal();
      return true;
    }
    toggleExitModal();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [exitModalVisible]);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected ?? null);
      } catch (error) {
        console.error("Error checking network state:", error);
        setIsConnected(null);
      }
    };

    checkNetwork();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isConnected === false) {
      setIsSearchScreenVisiable(false);
    } else if (gamemode === "ONLINE_WITH_BOTS" && !isPlaying) {
      setIsSearchScreenVisiable(true);

      const randomDuration =
        Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;

      timeoutId = setTimeout(() => {
        setIsSearchScreenVisiable(false);
      }, randomDuration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPlaying]);

  const handleResetgame = () => {
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
      setIsDynamicPopUp
    );
  };

  const randomMessageWin = useRandomMessage(
    policeIndex !== null && policeIndex >= 0
      ? playerNamesRedux[policeIndex]?.name || ""
      : "",
    "win"
  );
  const randomMessageLose = useRandomMessage(
    policeIndex !== null && policeIndex >= 0
      ? playerNamesRedux[policeIndex]?.name || ""
      : "",
    "lose"
  );

  const randomMessageThinking = useRandomMessage(
    policeIndex !== null && policeIndex >= 0
      ? playerNamesRedux[policeIndex]?.name || ""
      : "",
    "thinking"
  );

  const handlesetRoundStartMessage = () => {
    setRoundStartMessage("Round " + round + " starts!");
    setIsRoundStartPopupVisible(true);
    const timer = setTimeout(() => {
      setIsRoundStartPopupVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const handlePlay = () => {
    handlesetRoundStartMessage();
    const timer = setTimeout(() => {
      dispatch(playSound("select"));
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
        playerInfo
      );
    }, 1000);
    return () => clearTimeout(timer);
  };

  const updateScore = (
    playerIndex: number,
    newScore: number,
    roundIndex: number
  ) => {
    setPlayerScores((prevScores) =>
      updateScoreUtil(prevScores, playerIndex, newScore, roundIndex)
    );
  };

  const handleCardClick = (index: number) => {
    dispatch(playSound("select"));
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

    setFirstCardClicked(true); // Mark the first card as clicked
    if (
      isPlayButtonDisabled &&
      thiefIndex !== null &&
      policeIndex !== null &&
      advisorIndex !== null &&
      kingIndex !== null
    ) {
      const playerRole = roles[index];
      const currentPlayerImage = playerImages[selectedImages[policeIndex]]?.src;
      const currentPlayerImageType =
        playerImages[selectedImages[policeIndex]]?.type;

      // Store timeout IDs
      let winTimeoutId: NodeJS.Timeout | null = null;
      let loseTimeoutId: NodeJS.Timeout | null = null;
      let resetTimeoutId: NodeJS.Timeout | null = null;
      let gifTimeoutId: NodeJS.Timeout | null = null;

      if (playerRole === "Thief" && thiefIndex !== null) {
        handleRevealAllCards();

        winTimeoutId = setTimeout(() => {
          dispatch(playSound("win"));
        }, 2000);

        gifTimeoutId = setTimeout(() => {
          setMediaType("gif");
          setIsDynamicPopUp(true);
          setMediaId(4);

          setPlayerData({
            image: currentPlayerImage,
            message: randomMessageWin,
            imageType: currentPlayerImageType,
          });
        }, 5000);

        updateScore(thiefIndex, 0, round - 1);
        updateScore(policeIndex, 500, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        resetTimeoutId = setTimeout(() => resetForNextRoundHandler(), 8000);
      } else {
        handleRevealAllCards();

        loseTimeoutId = setTimeout(() => {
          dispatch(playSound("lose"));
        }, 2000);

        gifTimeoutId = setTimeout(() => {
          setMediaType("gif");
          setIsDynamicPopUp(true);
          setMediaId(3);
          setPlayerData({
            image: currentPlayerImage,
            message: randomMessageLose,
            imageType: currentPlayerImageType,
          });
        }, 5000);

        updateScore(thiefIndex, 500, round - 1);
        updateScore(policeIndex, 0, round - 1);
        updateScore(advisorIndex, 800, round - 1);
        updateScore(kingIndex, 1000, round - 1);
        setTimeout(() => resetForNextRoundHandler(), 8000);
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
          newClickedCards[index] = true;
          return newClickedCards;
        });
      }
      return () => {
        if (winTimeoutId) clearTimeout(winTimeoutId);
        if (loseTimeoutId) clearTimeout(loseTimeoutId);
        if (resetTimeoutId) clearTimeout(resetTimeoutId);
        if (gifTimeoutId) clearTimeout(gifTimeoutId);
      };
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
      dispatch
    );
  };

  const calculateTotalScores = () => {
    let updateTimeoutId: NodeJS.Timeout | null = null;

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

      if (updateTimeoutId) clearTimeout(updateTimeoutId);

      updateTimeoutId = setTimeout(() => {
        dispatch(updatePlayerScores(totalScoresArray));
      }, 500);

      return updatedScores;
    });

    return () => {
      if (updateTimeoutId) clearTimeout(updateTimeoutId);
    };
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
      router,
      setFirstCardClicked,
      setAreCardsClickable,
      setIsDynamicPopUp,
      setMediaId,
      setMediaType,
      selectedRounds
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
    popupIndex,
    isDynamicPopUp,
    mediaId,
    mediaType,
    playerData,
    isRoundStartPopupVisible,
    roundStartMessage,
    playerNamesRedux,
    randomMessageThinking,
    handleResetgame,
    setPopupIndex,
    setIsDynamicPopUp,
    isConnected,
    isSearchScreenVisiable,
    exitModalVisible,
    toggleExitModal,
    handleExitGame,
  };
};

export default useRajaMantriGame;
