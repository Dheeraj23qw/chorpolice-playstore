import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ─── Types ─── */

type Difficulty = "easy" | "medium" | "hard";

type AddQuizPayload = {
  result: "win" | "fail";
  accuracy: number;
  difficulty?: Difficulty;
};

type AddChorPolicePayload = {
  isWinner: boolean;
};

/* ─── State ─── */

export interface GameStatsState {
  totalWins: number;
  totalQuizzes: number;
  averageAccuracy: number;

  easyWins: number;
  mediumWins: number;
  hardWins: number;

  easyLosses: number;
  mediumLosses: number;
  hardLosses: number;

  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;

  // Chor Police
  cpGamesPlayed: number;
  cpGamesWon: number;
  cpGamesLoss: number;
}

/* ─── Initial State ─── */

export const defaultQuizStats: GameStatsState = {
  totalWins: 0,
  totalQuizzes: 0,
  averageAccuracy: 0,

  easyWins: 0,
  mediumWins: 0,
  hardWins: 0,

  easyLosses: 0,
  mediumLosses: 0,
  hardLosses: 0,

  easyTotal: 0,
  mediumTotal: 0,
  hardTotal: 0,

  cpGamesPlayed: 0,
  cpGamesWon: 0,
  cpGamesLoss: 0,
};

/* ─── Slice ─── */

const quizStatsSlice = createSlice({
  name: "quizStats",
  initialState: defaultQuizStats,

  reducers: {
    addQuizEntry: (state, action: PayloadAction<AddQuizPayload>) => {
      const { result, accuracy, difficulty = "easy" } = action.payload;

      const totalKey = `${difficulty}Total` as keyof GameStatsState;
      const winKey = `${difficulty}Wins` as keyof GameStatsState;
      const lossKey = `${difficulty}Losses` as keyof GameStatsState;
      const safeAccuracy = Math.max(0, Math.min(100, accuracy));

      // Total games
      state.totalQuizzes++;
      state[totalKey]++;

      // Win / Loss
      if (result === "win") {
        state.totalWins++;
        state[winKey]++;
      } else {
        state[lossKey]++;
      }

      state.averageAccuracy =
        (state.averageAccuracy * (state.totalQuizzes - 1) + safeAccuracy) /
        state.totalQuizzes;
    },

    /* 🎭 CHOR POLICE ENTRY */
    addChorPoliceEntry: (
      state,
      action: PayloadAction<AddChorPolicePayload>,
    ) => {
      const { isWinner } = action.payload;

      state.cpGamesPlayed++;

      if (isWinner) {
        state.cpGamesWon++;
      } else {
        state.cpGamesLoss++;
      }
    },

    /* 🔄 RESET */
    resetQuizStats: () => ({ ...defaultQuizStats }),

    /* 🔁 HYDRATE FROM STORAGE */
    setQuizStats: (_, action: PayloadAction<GameStatsState>) => {
      return action.payload;
    },
  },
});

/* ─── Exports ─── */

export const {
  addQuizEntry,
  addChorPoliceEntry,
} = quizStatsSlice.actions;

export default quizStatsSlice.reducer;
