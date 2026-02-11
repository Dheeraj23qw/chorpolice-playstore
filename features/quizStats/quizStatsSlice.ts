import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuizStatsState, QuizStatsEntry } from "./quizStatsTypes";

const MAX_HISTORY = 200;

const initialState: QuizStatsState & {
  easyWins: number;
  mediumWins: number;
  hardWins: number;
  easyLosses: number;
  mediumLosses: number;
  hardLosses: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
} = {
  currentStreak: 0,
  totalWins: 0,
  totalQuizzes: 0,
  averageAccuracy: 0,
  monthlyActivity: {},
  history: [],

  // Wins per difficulty
  easyWins: 0,
  mediumWins: 0,
  hardWins: 0,

  // Losses per difficulty
  easyLosses: 0,
  mediumLosses: 0,
  hardLosses: 0,

  // Total quizzes per difficulty
  easyTotal: 0,
  mediumTotal: 0,
  hardTotal: 0,
};

const quizStatsSlice = createSlice({
  name: "quizStats",
  initialState,
  reducers: {
    addQuizEntry: (state, action: PayloadAction<QuizStatsEntry>) => {
      const entry = action.payload;
      const dateKey = entry.date;
      const difficulty = entry.metadata?.difficulty; // "easy" | "medium" | "hard"

      // Add to history
      state.history.unshift(entry);
      if (state.history.length > MAX_HISTORY) state.history.pop();

      // Total quizzes
      state.totalQuizzes += 1;

      // Total quizzes per difficulty
      if (difficulty === "easy") state.easyTotal += 1;
      else if (difficulty === "medium") state.mediumTotal += 1;
      else if (difficulty === "hard") state.hardTotal += 1;

      // Wins / Losses per difficulty
      if (entry.result === "win") {
        state.totalWins += 1;
        if (difficulty === "easy") state.easyWins += 1;
        else if (difficulty === "medium") state.mediumWins += 1;
        else if (difficulty === "hard") state.hardWins += 1;
      } else {
        if (difficulty === "easy") state.easyLosses += 1;
        else if (difficulty === "medium") state.mediumLosses += 1;
        else if (difficulty === "hard") state.hardLosses += 1;
      }

      // Average accuracy
      state.averageAccuracy =
        (state.averageAccuracy * (state.totalQuizzes - 1) + entry.accuracy) /
        state.totalQuizzes;

      // Current streak
      const yesterday = new Date(new Date(dateKey).getTime() - 86400000)
        .toISOString()
        .slice(0, 10);
      if (state.monthlyActivity[yesterday]) {
        state.currentStreak += 1;
      } else if (!state.monthlyActivity[dateKey]) {
        state.currentStreak = 1;
      }

      // Mark played today
      state.monthlyActivity[dateKey] = true;
    },

    resetQuizStats: () => initialState,
  },
});

export const { addQuizEntry, resetQuizStats } = quizStatsSlice.actions;
export default quizStatsSlice.reducer;
