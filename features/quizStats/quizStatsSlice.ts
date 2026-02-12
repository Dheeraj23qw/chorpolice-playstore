// quizStatsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuizStatsState, QuizStatsEntry } from "./quizStatsTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUIZ_STATS_KEY = "QuizStats";
const MAX_HISTORY = 200;

// -------------------- DEFAULT STATE --------------------
export const defaultQuizStats: QuizStatsState = {
  currentStreak: 0,
  highestStreak: 0,
  totalWins: 0,
  totalQuizzes: 0,
  averageAccuracy: 0,
  monthlyActivity: {},
  history: [],
  easyWins: 0,
  mediumWins: 0,
  hardWins: 0,
  easyLosses: 0,
  mediumLosses: 0,
  hardLosses: 0,
  easyTotal: 0,
  mediumTotal: 0,
  hardTotal: 0,
};

// -------------------- ASYNC STORAGE HELPERS --------------------
export const saveQuizStats = async (stats: QuizStatsState) => {
  try {
    await AsyncStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
    if (__DEV__) console.log("💾 [QuizStats] Save successful", stats);
  } catch (e) {
    console.error("❌ [QuizStats] Save failed", e);
  }
};

export const loadQuizStats = async (): Promise<QuizStatsState> => {
  try {
    const jsonValue = await AsyncStorage.getItem(QUIZ_STATS_KEY);
    if (jsonValue) {
      const parsed: QuizStatsState = JSON.parse(jsonValue);
      if (__DEV__) console.log("🟢 [QuizStats] Loaded from storage", parsed);
      return { ...defaultQuizStats, ...parsed }; // merge with defaults
    }
    return defaultQuizStats;
  } catch (e) {
    console.error("❌ [QuizStats] Load failed", e);
    return defaultQuizStats;
  }
};

// -------------------- SLICE --------------------
const quizStatsSlice = createSlice({
  name: "quizStats",
  initialState: defaultQuizStats,
  reducers: {
    addQuizEntry: (state, action: PayloadAction<QuizStatsEntry>) => {
      const entry = action.payload;
      const difficulty = entry.metadata?.difficulty;
      const dateKey = entry.date;

      // -------------------- HISTORY --------------------
      state.history.unshift(entry);
      if (state.history.length > MAX_HISTORY) state.history.pop();

      // -------------------- TOTALS --------------------
      state.totalQuizzes += 1;
      if (difficulty === "easy") state.easyTotal += 1;
      else if (difficulty === "medium") state.mediumTotal += 1;
      else if (difficulty === "hard") state.hardTotal += 1;

      // -------------------- WIN / LOSS --------------------
      if (entry.result === "win") {
        state.totalWins += 1;

        if (difficulty === "easy") state.easyWins += 1;
        else if (difficulty === "medium") state.mediumWins += 1;
        else if (difficulty === "hard") state.hardWins += 1;

        // ✅ Consecutive win streak (day not relevant)
        state.currentStreak += 1;
        if (state.currentStreak > state.highestStreak) {
          state.highestStreak = state.currentStreak;
        }
      } else {
        if (difficulty === "easy") state.easyLosses += 1;
        else if (difficulty === "medium") state.mediumLosses += 1;
        else if (difficulty === "hard") state.hardLosses += 1;

        state.currentStreak = 0; // reset streak on loss
      }

      // -------------------- AVERAGE ACCURACY --------------------
      state.averageAccuracy =
        (state.averageAccuracy * (state.totalQuizzes - 1) + entry.accuracy) / state.totalQuizzes;

      // -------------------- DAILY ACTIVITY --------------------
      state.monthlyActivity[dateKey] = true;
    },

    resetQuizStats: () => ({ ...defaultQuizStats, history: [], monthlyActivity: {} }),

    setQuizStats: (_, action: PayloadAction<QuizStatsState>) => {
      if (__DEV__) console.log("🟢 [QuizStats] Hydrating from storage:", action.payload);
      return { ...defaultQuizStats, ...action.payload };
    },
  },
});

export const { addQuizEntry, resetQuizStats, setQuizStats } = quizStatsSlice.actions;
export default quizStatsSlice.reducer;
