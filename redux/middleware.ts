import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { addQuizEntry } from "@/features/quizStats/quizStatsSlice";
import { saveWallet } from "@/features/wallet/walletSlice"; // Import your MMKV savers
import { saveQuizStats } from "@/features/quizStats/quizStatsSlice";
import { 
  scheduleDailyStreakReminder, 
  cancelDailyStreakReminder 
} from "@/service/notification/notication_types/quiz.daily_streak.notifications";
import type { RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

/* ------------------ 1. NOTIFICATIONS ------------------ */
listenerMiddleware.startListening({
  actionCreator: addQuizEntry,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const streak = state.quizStats.dailyStreak;

    if (streak > 0) {
      scheduleDailyStreakReminder(streak);
    } else {
      cancelDailyStreakReminder();
    }
  },
});

/* ------------------ 2. PERSISTENCE (MMKV) ------------------ */
listenerMiddleware.startListening({
  // Use 'predicate' alone to monitor state changes broadly
  predicate: (action, currentState, previousState) => {
    const cur = currentState as RootState;
    const prev = previousState as RootState;
    return cur.wallet !== prev.wallet || cur.quizStats !== prev.quizStats;
  },
  effect: (action, listenerApi) => {
    // Cast state to RootState to get full type safety
    const state = listenerApi.getState() as RootState;
    
    saveWallet(state.wallet);
    saveQuizStats(state.quizStats);
    
  },
});