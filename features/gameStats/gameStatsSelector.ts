import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

const selectQuizStats = (state: RootState) => state.quizStats;

export const selectUserQuizStats = createSelector(
  [selectQuizStats],
  (quizStats) => ({
    total_quizzes: quizStats.totalQuizzes,
    wins: quizStats.totalWins,
    losses: quizStats.totalQuizzes - quizStats.totalWins,

    averageAccuracy: Math.round(quizStats.averageAccuracy),

    easyWins: quizStats.easyWins,
    mediumWins: quizStats.mediumWins,
    hardWins: quizStats.hardWins,

    easyLosses: quizStats.easyLosses,
    mediumLosses: quizStats.mediumLosses,
    hardLosses: quizStats.hardLosses,

    easyPlayed: quizStats.easyTotal,
    mediumPlayed: quizStats.mediumTotal,
    hardPlayed: quizStats.hardTotal,

    // Chor Police
    cpPlayed: quizStats.cpGamesPlayed,
    cpWins: quizStats.cpGamesWon,
    cpLosses: quizStats.cpGamesLoss,
  }),
);
