import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { updateCoins, setCoins } from "@/features/wallet/walletSlice";
import {
  addQuizEntry,
  addChorPoliceEntry,
} from "@/features/gameStats/gameStatsSlice";

import { saveWallet } from "@/storage/walletStorage";
import { saveQuizStats } from "@/storage/quizStatsStorage";

import type { RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

/* ------------------ WALLET AUTO SAVE ------------------ */
listenerMiddleware.startListening({
  matcher: isAnyOf(updateCoins, setCoins),
  effect: (_, api) => {
    const state = api.getState() as RootState;
    saveWallet(state.wallet);
  },
});

/* ------------------ QUIZ STATS AUTO SAVE ------------------ */
listenerMiddleware.startListening({
  matcher: isAnyOf(addQuizEntry, addChorPoliceEntry), // ✅ FIXED
  effect: (_, api) => {
    const state = api.getState() as RootState;
    saveQuizStats(state.quizStats);
  },
});
