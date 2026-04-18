import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuizStatsState } from "./quizStatsTypes";

/* ─── Payload Types ─── */

type AddQuizPayload = {
  result: "win" | "fail";
  accuracy: number;
  difficulty?: "easy" | "medium" | "hard";
};

type AddChorPolicePayload = {
  isWinner: boolean;
  totalRounds: number;
  correctGuesses: number;
  coinsEarned: number;
};

/* ─── Defaults ─── */

export const defaultQuizStats: QuizStatsState = {
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

  // Streaks
  currentStreak: 0,
  highestStreak: 0,

  // Chor Police
  cpGamesPlayed: 0,
  cpGamesWon: 0,
  cpTotalRounds: 0,
  cpCorrectGuesses: 0,
  cpCoinsEarned: 0,
};

const quizStatsSlice = createSlice({
  name: "quizStats",
  initialState: defaultQuizStats,
  reducers: {
    /**
     * Record a completed quiz game (Think & Count)
     */
    addQuizEntry: (state, action: PayloadAction<AddQuizPayload>) => {
      const { result, accuracy, difficulty } = action.payload;

      const d = difficulty ?? "easy";

      // 📊 TOTAL
      state.totalQuizzes++;
      (state as any)[`${d}Total`]++;

      // 🏆 WIN / LOSS + STREAK
      if (result === "win") {
        state.totalWins++;
        (state as any)[`${d}Wins`]++;
        state.currentStreak++;
        if (state.currentStreak > state.highestStreak) {
          state.highestStreak = state.currentStreak;
        }
      } else {
        (state as any)[`${d}Losses`]++;
        state.currentStreak = 0; // Reset streak on loss
      }

      // 🎯 ACCURACY (running average)
      state.averageAccuracy =
        (state.averageAccuracy * (state.totalQuizzes - 1) + accuracy) /
        state.totalQuizzes;
    },

    /**
     * Record a completed Chor Police game
     */
    addChorPoliceEntry: (
      state,
      action: PayloadAction<AddChorPolicePayload>,
    ) => {
      const { isWinner, totalRounds, correctGuesses, coinsEarned } =
        action.payload;

      state.cpGamesPlayed++;
      if (isWinner) state.cpGamesWon++;
      state.cpTotalRounds += totalRounds;
      state.cpCorrectGuesses += correctGuesses;
      state.cpCoinsEarned += coinsEarned;
    },

    // 🔄 RESET
    resetQuizStats: () => defaultQuizStats,

    // 🔁 HYDRATE (used by storage loader)
    setQuizStats: (_, action: PayloadAction<QuizStatsState>) => {
      return action.payload;
    },
  },
});

export const { addQuizEntry, addChorPoliceEntry, resetQuizStats, setQuizStats } =
  quizStatsSlice.actions;

export default quizStatsSlice.reducer;
