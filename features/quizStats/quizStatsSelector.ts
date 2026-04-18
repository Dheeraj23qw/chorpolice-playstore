import { RootState } from "@/redux/store";

// 📊 Full stats
export const selectQuizStats = (state: RootState) => state.quizStats;

// 🏆 Win rate
export const selectQuizWinRate = (state: RootState) =>
  state.quizStats.totalQuizzes
    ? state.quizStats.totalWins / state.quizStats.totalQuizzes
    : 0;

// 🎯 Accuracy
export const selectAverageAccuracy = (state: RootState) =>
  state.quizStats.averageAccuracy;

// 📈 Difficulty Wins
export const selectEasyWins = (state: RootState) => state.quizStats.easyWins;
export const selectMediumWins = (state: RootState) => state.quizStats.mediumWins;
export const selectHardWins = (state: RootState) => state.quizStats.hardWins;

// 📉 Difficulty Losses
export const selectEasyLosses = (state: RootState) => state.quizStats.easyLosses;
export const selectMediumLosses = (state: RootState) => state.quizStats.mediumLosses;
export const selectHardLosses = (state: RootState) => state.quizStats.hardLosses;

// 📊 Total per difficulty
export const selectTotalEasyQuizzes = (state: RootState) => state.quizStats.easyTotal;
export const selectTotalMediumQuizzes = (state: RootState) => state.quizStats.mediumTotal;
export const selectTotalHardQuizzes = (state: RootState) => state.quizStats.hardTotal;

// 🔥 Streaks
export const selectCurrentStreak = (state: RootState) => state.quizStats.currentStreak;
export const selectHighestStreak = (state: RootState) => state.quizStats.highestStreak;

// 🚔 Chor Police Stats
export const selectCPGamesPlayed = (state: RootState) => state.quizStats.cpGamesPlayed;
export const selectCPGamesWon = (state: RootState) => state.quizStats.cpGamesWon;
export const selectCPTotalRounds = (state: RootState) => state.quizStats.cpTotalRounds;
export const selectCPCorrectGuesses = (state: RootState) => state.quizStats.cpCorrectGuesses;
export const selectCPCoinsEarned = (state: RootState) => state.quizStats.cpCoinsEarned;
export const selectCPWinRate = (state: RootState) =>
  state.quizStats.cpGamesPlayed
    ? state.quizStats.cpGamesWon / state.quizStats.cpGamesPlayed
    : 0;
