import { createListenerMiddleware } from "@reduxjs/toolkit";

import { applyTransaction, claimSpinReward } from "@/features/wallet/walletSlice";
import { addQuizEntry, addChorPoliceEntry } from "@/features/quizStats/quizStatsSlice";

import { saveWallet } from "@/storage/walletStorage";
import { saveQuizStats } from "@/storage/quizStatsStorage";

import type { RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

/* ------------------ WALLET AUTO SAVE ------------------ */
// Save wallet after any coin transaction
listenerMiddleware.startListening({
  actionCreator: applyTransaction,
  effect: (action, api) => {
    const state = api.getState() as RootState;
    saveWallet(state.wallet);
  },
});

// Save wallet after spin reward claim too
listenerMiddleware.startListening({
  actionCreator: claimSpinReward,
  effect: (action, api) => {
    const state = api.getState() as RootState;
    saveWallet(state.wallet);
  },
});

/* ------------------ QUIZ STATS AUTO SAVE ------------------ */
listenerMiddleware.startListening({
  actionCreator: addQuizEntry,
  effect: (action, api) => {
    const state = api.getState() as RootState;
    saveQuizStats(state.quizStats);
  },
});
