import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { resetStreak, updateStreak } from "@/features/gameStreakSlice";
import {
  addChorPoliceEntry,
  addQuizEntry,
} from "@/features/gameStats/gameStatsSlice";
import {
  claimFirstLaunchBonus,
  setCoins,
  setFirstLaunch,
  updateCoins,
} from "@/features/wallet/walletSlice";
import { saveGameStreak } from "@/storage/gameStreakStorage";
import { saveQuizStats } from "@/storage/quizStatsStorage";
import { saveWallet } from "@/storage/walletStorage";

import type { RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(
    updateCoins,
    setCoins,
    setFirstLaunch,
    claimFirstLaunchBonus,
  ),
  effect: (_, api) => {
    const state = api.getState() as RootState;
    saveWallet(state.wallet);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(addQuizEntry, addChorPoliceEntry),
  effect: (_, api) => {
    const state = api.getState() as RootState;
    saveQuizStats(state.quizStats);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(updateStreak, resetStreak),
  effect: (_, api) => {
    const state = api.getState() as RootState;
    saveGameStreak(state.gameStreak);
  },
});
