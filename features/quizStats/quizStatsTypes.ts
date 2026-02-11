export interface QuizStatsEntry {
  id: string; // timestamp id
  result: "win" | "fail";
  accuracy: number; // 0-1
  coinsEarned?: number;
  date: string; // ISO date
  metadata?: {
    difficulty?: "easy" | "medium" | "hard"; // added difficulty
    [key: string]: any;
  };
}

export interface QuizStatsState {
  currentStreak: number; // consecutive days played
  totalWins: number;
  totalQuizzes: number;
  averageAccuracy: number;
  monthlyActivity: Record<string, boolean>; // yyyy-mm-dd => played or not
  history: QuizStatsEntry[]; // like wallet transactions

  // Wins per difficulty
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
}

