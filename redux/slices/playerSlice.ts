import playerName from "@/screens/playerNameScreen/playerName";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the PlayerScore interface
interface PlayerScore {
  playerName: string;
  totalScore: number;
}

// Define the PlayerName interface with isBot as optional
interface PlayerName {
  id: number;
  name: string;
  isBot?: boolean;
}

// Define the GameMode type
export type GameMode = "OFFLINE" | "ONLINE_WITH_REAL_PLAYERS" | "ONLINE_WITH_FRIENDS" | "ONLINE_WITH_BOTS" | "OFFLINE_WITH_BOTS" | "QUIZ_WITH_BOTS";

// Define the PlayerState interface
interface PlayerState {
  selectedImages: number[];
  playerNames: PlayerName[];
  playerScores: PlayerScore[];
  gameMode: GameMode;
}

// Define the initial state for the Player slice
const initialState: PlayerState = {
  selectedImages: [],
  playerNames: [],
  playerScores: [],
  gameMode: "OFFLINE",
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
    resetGame() {
      return initialState;
    },
    playAgain(state) {
      // Reset playerScores while keeping player names intact
      state.playerScores = state.playerNames.map((player) => ({
        playerName: player.name,
        totalScore: 0,
      }));
    },
  },
});

// Export actions and reducer
export const {
  setSelectedImages,
  setPlayerNames,
  updatePlayerScores,
  setGameMode,
  resetGame,
  playAgain,
} = playerSlice.actions;

export default playerSlice.reducer;
