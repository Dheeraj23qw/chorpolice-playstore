import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuizStatsState, QuizStatsEntry } from "./quizStatsTypes";
import {
  cancelDailyStreakReminder,
  scheduleDailyStreakReminder,
} from "@/service/notification/notication_types/quiz.daily_streak.notifications";
import { storage } from "@/storage/mmkv";

const QUIZ_STATS_KEY = "QuizStats";
const MAX_HISTORY = 200;

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
  dailyStreak: 0,
  highestDailyStreak: 0,
  lastPlayedDate: null,
};

// -------------------- STORAGE HELPERS --------------------

export const saveQuizStats = (stats: QuizStatsState) => {
  try {
    storage.set(QUIZ_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("❌ [QuizStats] Save failed", e);
  }
};


export const loadQuizStats = (): QuizStatsState | undefined => {
  try {
    const jsonValue = storage.getString(QUIZ_STATS_KEY);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
  } catch (e) {
    console.error("❌ [QuizStats] Load failed", e);
  }
  return undefined;
};

// -------------------- SLICE --------------------

const quizStatsSlice = createSlice({
  name: "quizStats",
  initialState: defaultQuizStats,
  reducers: {
    addQuizEntry: (state, action: PayloadAction<QuizStatsEntry>) => {
      const entry = action.payload;
      const difficulty = entry.metadata?.difficulty;
      const today = entry.date; 
      const lastDate = state.lastPlayedDate;

      // 1. Daily Streak Logic
      if (!lastDate) {
        state.dailyStreak = 1;
      } else if (lastDate !== today) {
        const todayDate = new Date(today + "T00:00:00");
        const lastPlayed = new Date(lastDate + "T00:00:00");
        const diffDays = (todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          state.dailyStreak += 1;
        } else if (diffDays > 1) {
          state.dailyStreak = 1;
        }
      }

      state.lastPlayedDate = today;
      if (state.dailyStreak > state.highestDailyStreak) {
        state.highestDailyStreak = state.dailyStreak;
      }

   

      // 2. History
      state.history.unshift(entry);
      if (state.history.length > MAX_HISTORY) state.history.pop();

      // 3. Totals & Stats
      state.totalQuizzes += 1;
      if (difficulty === "easy") state.easyTotal += 1;
      else if (difficulty === "medium") state.mediumTotal += 1;
      else if (difficulty === "hard") state.hardTotal += 1;

      if (entry.result === "win") {
        state.totalWins += 1;
        if (difficulty === "easy") state.easyWins += 1;
        else if (difficulty === "medium") state.mediumWins += 1;
        else if (difficulty === "hard") state.hardWins += 1;

        state.currentStreak += 1;
        if (state.currentStreak > state.highestStreak) state.highestStreak = state.currentStreak;
      } else {
        if (difficulty === "easy") state.easyLosses += 1;
        else if (difficulty === "medium") state.mediumLosses += 1;
        else if (difficulty === "hard") state.hardLosses += 1;
        state.currentStreak = 0;
      }

      state.averageAccuracy =
        (state.averageAccuracy * (state.totalQuizzes - 1) + entry.accuracy) / state.totalQuizzes;

      state.monthlyActivity[today] = true;
    },

    resetQuizStats: () => {
      storage.remove(QUIZ_STATS_KEY);
      return defaultQuizStats;
    },

    setQuizStats: (_, action: PayloadAction<QuizStatsState>) => {
      return action.payload;
    },
  },
});

export const { addQuizEntry, resetQuizStats, setQuizStats } = quizStatsSlice.actions;
export default quizStatsSlice.reducer;