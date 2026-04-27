import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { resetStreak, updateStreak } from "@/features/gameStreakSlice";
import {
  addChorPoliceEntry,
  addQuizEntry,
} from "@/features/gameStats/gameStatsSlice";
import {
  claimDailyBonus,
  markRated,
  resetLocks,
  useSpin,
} from "@/features/locks/lockSlice";
import {
  claimFirstLaunchBonus,
  setCoins,
  setFirstLaunch,
  updateCoins,
} from "@/features/wallet/walletSlice";
import { saveGameStreak } from "@/storage/gameStreakStorage";
import { saveLocks } from "@/storage/lockStorage";
import { saveQuizStats } from "@/storage/quizStatsStorage";
import { saveWallet } from "@/storage/walletStorage";
import { notificationService } from "@/service/notification/NotificationService";
import { REWARD_TIERS } from "@/constants/RewardsConst";
import { getClaimedRewards } from "@/storage/rewardStorage";
import { storage } from "@/storage/mmkv";
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

    // 🎯 Milestone Nudges
    const coins = state.wallet.coins;
    const claimed = getClaimedRewards();
    
    for (const tier of REWARD_TIERS) {
      if (claimed.includes(tier.id)) continue;

      const remaining = tier.coinsRequired - coins;
      if (remaining > 0 && remaining <= 25000) {
        // Only nudge once every 24h for this tier
        const lastNudgeKey = `last_nudge_${tier.id}`;
        const lastNudge = storage.getNumber(lastNudgeKey) || 0;
        const now = Date.now();

        if (now - lastNudge > 24 * 60 * 60 * 1000) {
          storage.set(lastNudgeKey, now);
          void notificationService.scheduleMilestoneNudge(tier.reward, remaining);
          break; // Only nudge for the closest one
        }
      }
    }
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

listenerMiddleware.startListening({
  matcher: isAnyOf(useSpin, claimDailyBonus, markRated, resetLocks),
  effect: (action, api) => {
    const state = api.getState() as RootState;
    saveLocks(state.lock);

    // Schedule Notifications for rewards
    if (action.type === useSpin.type) {
      void notificationService.scheduleSpinReminder();
    } else if (action.type === claimDailyBonus.type) {
      void notificationService.scheduleDailyBonusReminder();
    }
  },
});
