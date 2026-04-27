import {
  PlayerName,
  PlayerScore,
  PlayerState,
} from "@/types/redux/reducers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Initial State
const initialState: PlayerState = {
  selectedImages: [],
  playerNames: [],
  playerScores: [],
  playerScoresByRound: [],
  gameMode: "OFFLINE",
  isGameReset: false,
  gameRound: 5,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // -------------------- Images --------------------
    setSelectedImages(state, action: PayloadAction<number[]>) {
      state.selectedImages = action.payload.filter(
        (img) => Number.isInteger(img) && img >= 0
      );
    },

    // -------------------- Player Names --------------------
    setPlayerNames(state, action: PayloadAction<PlayerName[]>) {
      state.playerNames = action.payload.filter(
        (player) =>
          (typeof player.id === "number" || typeof player.id === "string") &&
          typeof player.name === "string" &&
          player.name.trim().length > 0
      );
    },

    // -------------------- Player Scores --------------------
    updatePlayerScores(state, action: PayloadAction<PlayerScore[]>) {
      state.playerScores = action.payload.filter(
        (score) =>
          (score.playerId === undefined || typeof score.playerId === "string") &&
          typeof score.playerName === "string" &&
          score.playerName.trim().length > 0 &&
          typeof score.totalScore === "number" &&
          Number.isFinite(score.totalScore)
      );
    },

    setIsGameReset(state, action: PayloadAction<boolean>) {
      state.isGameReset = action.payload;
    },

    // -------------------- Round --------------------
    setGameRound(state, action: PayloadAction<number>) {
      if (action.payload >= 3) {
        state.gameRound = action.payload | 0; // fast integer cast
      }
    },
  },
});

// Exports
export const {
  setSelectedImages,
  setPlayerNames,
  updatePlayerScores,
  setGameRound,
  setIsGameReset,
} = playerSlice.actions;

export default playerSlice.reducer;
