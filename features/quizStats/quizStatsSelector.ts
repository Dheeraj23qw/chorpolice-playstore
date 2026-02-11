import { RootState } from "@/redux/store";

// Full quiz stats
export const selectQuizStats = (state: RootState) => state.quizStats;

// Win rate overall
export const selectQuizWinRate = (state: RootState) =>
  state.quizStats.totalQuizzes
    ? state.quizStats.totalWins / state.quizStats.totalQuizzes
    : 0;

// Current streak
export const selectCurrentStreak = (state: RootState) =>
  state.quizStats.currentStreak;

// Average accuracy
export const selectAverageAccuracy = (state: RootState) =>
  state.quizStats.averageAccuracy;

// Monthly activity (for calendar heatmaps)
export const selectMonthlyActivity = (state: RootState) =>
  state.quizStats.monthlyActivity;

// Difficulty-specific wins
export const selectEasyWins = (state: RootState) => state.quizStats.easyWins;
export const selectMediumWins = (state: RootState) => state.quizStats.mediumWins;
export const selectHardWins = (state: RootState) => state.quizStats.hardWins;

// Difficulty-specific losses (optional)
export const selectEasyLosses = (state: RootState) => state.quizStats.easyLosses;
export const selectMediumLosses = (state: RootState) => state.quizStats.mediumLosses;
export const selectHardLosses = (state: RootState) => state.quizStats.hardLosses;

// Optional: Total quizzes per difficulty
export const selectTotalEasyQuizzes = (state: RootState) =>
  state.quizStats.easyWins + state.quizStats.easyLosses;
export const selectTotalMediumQuizzes = (state: RootState) =>
  state.quizStats.mediumWins + state.quizStats.mediumLosses;
export const selectTotalHardQuizzes = (state: RootState) =>
  state.quizStats.hardWins + state.quizStats.hardLosses;
