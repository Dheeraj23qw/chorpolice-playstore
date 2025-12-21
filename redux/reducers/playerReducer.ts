import {
  GameMode,
  PlayerName,
  PlayerScore,
  PlayerScoresByRound,
  PlayerState,
} from "@/types/redux/reducers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";

// Define the initial state for the Player slice
const initialState: PlayerState = {
  selectedImages: [],
  playerNames: [],
  playerScores: [],
  playerScoresByRound: [], // Initialize empty playerScoresByRound
  gameMode: "OFFLINE",
  isGameReset: false, // New property to track if the game is reset
  gameRound: 4,
};

// Create the player slice
const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setSelectedImages: {
      reducer(state, action: PayloadAction<number[]>) {
        state.selectedImages = action.payload;
      },
      prepare(images: number[]) {
        return {
          payload: images.filter((img) => Number.isInteger(img) && img >= 0),
        };
      },
    },
    setPlayerNames: {
      reducer(state, action: PayloadAction<PlayerName[]>) {
        state.playerNames = action.payload;
      },
      prepare(names: PlayerName[]) {
        return {
          payload: names.filter(
            (player) =>
              player.id >= 0 &&
              typeof player.name === "string" &&
              player.name.trim() !== "" &&
              (typeof player.isBot === "boolean" || player.isBot === undefined)
          ),
        };
      },
    },
    updatePlayerScores: {
      reducer(state, action: PayloadAction<PlayerScore[]>) {
        state.playerScores = action.payload;
      },
      prepare(scores: PlayerScore[]) {
        return {
          payload: scores.filter(
            (score) =>
              typeof score.playerName === "string" &&
              score.playerName.trim() !== "" &&
              typeof score.totalScore === "number" &&
              Number.isFinite(score.totalScore)
          ),
        };
      },
    },
    setGameMode(state, action: PayloadAction<GameMode>) {
      state.gameMode = action.payload;
    },
    resetGamefromRedux(state) {
      const { gameRound } = state;
      return { ...initialState, gameRound, isGameReset: true };
    },
    setIsGameReset(state, action: PayloadAction<boolean>) {
      state.isGameReset = action.payload; // Set the value of isGameReset
    },
    setGameRound(state, action: PayloadAction<number>) {
      if (Number.isInteger(action.payload) && action.payload > 0) {
        state.gameRound = action.payload;
      }
    },
    playAgain(state) {
      // Reset playerScores while keeping player names intact
      state.playerScores = state.playerNames.map((player) => ({
        playerName: player.name,
        totalScore: 0,
      }));
    },
    // New action to update player scores by round
    updateScoresByRound: {
      reducer(state, action: PayloadAction<PlayerScoresByRound[]>) {
        const roundScores = action.payload;
        // Update or add player round scores
        roundScores.forEach(({ playerName, scores }) => {
          const player = state.playerScoresByRound.find(
            (player) => player.playerName === playerName
          );

          if (!player) {
            state.playerScoresByRound.push({ playerName, scores: [...scores] });
          } else {
            player.scores = [...scores];
          }
        });
      },
      prepare(roundScores: PlayerScoresByRound[]) {
        return {
          payload: roundScores.map((roundScore) => ({
            playerName: roundScore.playerName,
            scores: roundScore.scores.filter(
              (score) => typeof score === "number" && score >= 0
            ),
          })),
        };
      },
    },
  },
});

// Export actions and reducer
export const {
  setSelectedImages,
  setPlayerNames,
  updatePlayerScores,
  setGameMode,
  resetGamefromRedux,
  playAgain,
  updateScoresByRound,
  setGameRound,
  setIsGameReset,
} = playerSlice.actions;

export default playerSlice.reducer;


