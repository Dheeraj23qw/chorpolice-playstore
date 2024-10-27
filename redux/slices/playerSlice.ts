import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerScore {
  playerName: string;
  totalScore: number;
}

interface PlayerName {
  id: number;
  name: string;
}

interface PlayerState {
  selectedImages: number[];
  playerNames: PlayerName[];
  playerScores: PlayerScore[];
}

const initialState: PlayerState = {
  selectedImages: [],
  playerNames: [],
  playerScores: [],
};

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
              player.name.trim() !== ""
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
              Number.isFinite(score.totalScore)
          ),
        };
      },
    },
    resetGame(state) {
      return initialState;
    },
    playAgain(state) {
      state.playerScores = state.playerNames.map((player) => ({
        playerName: player.name,
        totalScore: 0,
      }));
    },
  },
});

export const {
  setSelectedImages,
  setPlayerNames,
  updatePlayerScores,
  resetGame,
  playAgain,
} = playerSlice.actions;

export default playerSlice.reducer;
