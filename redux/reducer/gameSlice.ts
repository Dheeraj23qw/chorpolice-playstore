import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Animated } from "react-native";

import { GameState,PlayerData } from "@/types/redux/reducers";
const initialState: GameState = {
  flippedStates: [false, false, false, false], // Replaced flipAnims with flippedStates (booleans)
  clickedCards: [false, false, false, false],
  selectedPlayer: 1,
  message: "",
  roles: ["King", "Advisor", "Thief", "Police"],
  isPlayButtonDisabled: false,
  policeClickCount: 0,
  policePlayerName: null,
  policeIndex: null,
  kingIndex: null,
  advisorIndex: null,
  thiefIndex: null,
  playerScores: [], // Will be updated dynamically
  round: 1,
  videoIndex: 1,
  isPlaying: false,
  areCardsClickable: false,
  isModalVisible: false,
  popupIndex: null,
  firstCardClicked: false,
  isDynamicPopUp: false,
  mediaId: 1,
  mediaType: "image",
  playerData: {
    image: null,
    message: null,
    imageType: null,
  },
  isRoundStartPopupVisible: false,
  roundStartMessage: "",
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setFlippedStates(state, action: PayloadAction<boolean[]>) {
      state.flippedStates = action.payload; // Track flipped states with booleans
    },
    setClickedCards(state, action: PayloadAction<boolean[]>) {
      state.clickedCards = action.payload;
    },
    setSelectedPlayer(state, action: PayloadAction<number>) {
      state.selectedPlayer = action.payload;
    },
    setMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload;
    },
    setIsPlayButtonDisabled(state, action: PayloadAction<boolean>) {
      state.isPlayButtonDisabled = action.payload;
    },
    setPoliceClickCount(state, action: PayloadAction<number>) {
      state.policeClickCount = action.payload;
    },
    setPolicePlayerName(state, action: PayloadAction<string | null>) {
      state.policePlayerName = action.payload;
    },
    setPoliceIndex(state, action: PayloadAction<number | null>) {
      state.policeIndex = action.payload;
    },
    setKingIndex(state, action: PayloadAction<number | null>) {
      state.kingIndex = action.payload;
    },
    setAdvisorIndex(state, action: PayloadAction<number | null>) {
      state.advisorIndex = action.payload;
    },
    setThiefIndex(state, action: PayloadAction<number | null>) {
      state.thiefIndex = action.payload;
    },
    setPlayerScores(state, action: PayloadAction<any>) {
      state.playerScores = action.payload;
    },
    setRound(state, action: PayloadAction<number>) {
      state.round = action.payload;
    },
    setVideoIndex(state, action: PayloadAction<number>) {
      state.videoIndex = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setAreCardsClickable(state, action: PayloadAction<boolean>) {
      state.areCardsClickable = action.payload;
    },
    setIsModalVisible(state, action: PayloadAction<boolean>) {
      state.isModalVisible = action.payload;
    },
    setPopupIndex(state, action: PayloadAction<number | null>) {
      state.popupIndex = action.payload;
    },
    setFirstCardClicked(state, action: PayloadAction<boolean>) {
      state.firstCardClicked = action.payload;
    },
    setIsDynamicPopUp(state, action: PayloadAction<boolean>) {
      state.isDynamicPopUp = action.payload;
    },
    setMediaId(state, action: PayloadAction<number>) {
      state.mediaId = action.payload;
    },
    setMediaType(state, action: PayloadAction<"image" | "video" | "gif">) {
      state.mediaType = action.payload;
    },
    setPlayerData(state, action: PayloadAction<PlayerData>) {
      state.playerData = action.payload;
    },
    setIsRoundStartPopupVisible(state, action: PayloadAction<boolean>) {
      state.isRoundStartPopupVisible = action.payload;
    },
    setRoundStartMessage(state, action: PayloadAction<string>) {
      state.roundStartMessage = action.payload;
    },
  },
});

export const {
  setFlippedStates,
  setClickedCards,
  setSelectedPlayer,
  setMessage,
  setRoles,
  setIsPlayButtonDisabled,
  setPoliceClickCount,
  setPolicePlayerName,
  setPoliceIndex,
  setKingIndex,
  setAdvisorIndex,
  setThiefIndex,
  setPlayerScores,
  setRound,
  setVideoIndex,
  setIsPlaying,
  setAreCardsClickable,
  setIsModalVisible,
  setPopupIndex,
  setFirstCardClicked,
  setIsDynamicPopUp,
  setMediaId,
  setMediaType,
  setPlayerData,
  setIsRoundStartPopupVisible,
  setRoundStartMessage,
} = gameSlice.actions;

export default gameSlice.reducer;
