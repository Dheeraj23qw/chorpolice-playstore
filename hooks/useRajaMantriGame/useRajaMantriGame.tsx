import { useState, useEffect } from "react";
import { Animated } from "react-native";
import { BackHandler } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { resetGame } from "./utils/resetGameUtils";
import { flipCard } from "./utils/flipCardUtil";
import { calculateTotalScores } from "./utils/totalScoreUtils";
import {
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/reducers/soundReducer";
import { revealAllCards } from "./utils/revealAllCardsUtils";
import { resetForNextRound } from "./utils/resetForNextRound";
import { handlePlayHelper } from "./gameHelper/handleplay";
import { updateScoreUtil } from "./utils/updateScoreUtil";
import { RootState } from "@/redux/store";
import useRandomMessage from "../useRandomMessage";

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
      scores: Array.from({ length: 10 }, () => 0),
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
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">(
    "image"
  );
  const [playerData, setPlayerData] = useState<PlayerData>({
    image: null,
    message: null,
    imageType: null,
  });
  const [isRoundStartPopupVisible, setIsRoundStartPopupVisible] = useState(false);
  const [roundStartMessage, setRoundStartMessage] = useState("");




  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages
  );
  const playerNamesRedux = useSelector(
    (state: RootState) => state.player.playerNames
  );

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
  const handlesetRoundStartMessage=()=>{
    setRoundStartMessage("Round " + round + " starts!");
    setIsRoundStartPopupVisible(true);
    setTimeout(() => {
      setIsRoundStartPopupVisible(false);
    }, 3000);
  }

  const handlePlay = () => {
    handlesetRoundStartMessage()
    setTimeout(() => {
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
        setPopupIndex
      );
    }, 1000);
    
  
  };

  // koi matlab nhi isse
  const updateScore = (
    playerIndex: number,
    newScore: number,
    roundIndex: number
  ) => {
    setPlayerScores((prevScores) =>
      updateScoreUtil(prevScores, playerIndex, newScore, roundIndex)
    );
  };

  //isse se hai matlab
  const handleCardClick = (index: number) => {
    dispatch(playSound("select"));
    if (
      !areCardsClickable ||
      !isPlayButtonDisabled ||
      flippedStates[index] || // Prevent clicking flipped cards
      clickedCards[index] // Prevent clicking already clicked cards
    ) {
      return; // Exit if the card is flipped or already clicked
    }

    if (firstCardClicked) {
      return; // If the first card has already been clicked, do nothing on the second card
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

      if (playerRole === "Thief" && thiefIndex !== null) {
        handleRevealAllCards();

        setTimeout(() => {
          dispatch(playSound("win"));
        }, 2000);

        setTimeout(() => {
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
        setTimeout(() => resetForNextRoundHandler(), 8000);
      } else {
        handleRevealAllCards();

        setTimeout(() => {
          dispatch(playSound("lose"));
        }, 2000);
        setTimeout(() => {
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

  const calculateTotalScoresHandler = () => {
    setPlayerScores((prevScores) => calculateTotalScores(prevScores, dispatch));
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
      calculateTotalScoresHandler,
      router,
      setFirstCardClicked,
      setAreCardsClickable,
      setIsDynamicPopUp,
      setMediaId,
      setMediaType,
      // setIsRoundStartPopupVisible
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
  };
};

export default useRajaMantriGame;
