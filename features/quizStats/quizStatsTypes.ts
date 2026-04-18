export interface QuizStatsState {
  // --- Quiz Stats ---
  totalWins: number;
  totalQuizzes: number;
  averageAccuracy: number;

  easyWins: number;
  mediumWins: number;
  hardWins: number;

  // Losses per difficulty
  easyLosses: number;
  mediumLosses: number;
  hardLosses: number;

  // Total quizzes per difficulty
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;

  // --- Streaks ---
  currentStreak: number;
  highestStreak: number;

  // --- Chor Police Stats ---
  cpGamesPlayed: number;
  cpGamesWon: number;
  cpTotalRounds: number;
  cpCorrectGuesses: number;
  cpCoinsEarned: number;
}
