import { configureStore } from "@reduxjs/toolkit";

import playerReducer from "./reducers/playerReducer";
import soundSlice from "./reducers/soundReducer";
import playerImagesReducer from "./reducers/dynamicImagesReducer";
import difficultyReducer from "@/redux/reducers/quiz";
import popupReducer from "./reducers/popupReducer";
import awardsReducer from "@/features/awards/awardsSlice";
import lockReducer from "@/features/locks/lockSlice";
import walletReducer from "@/features/wallet/walletSlice";
import quizStatsReducer, {
  defaultQuizStats,
} from "@/features/gameStats/gameStatsSlice";

import { listenerMiddleware } from "./middleware";
import { loadQuizStats } from "@/storage/quizStatsStorage";
import { loadWallet } from "@/storage/walletStorage";

/**
 * ✅ SAFE LOADERS — Hydrate from MMKV on startup
 */

// WALLET (simple → fine)
const preloadedWallet = loadWallet() ?? { coins: 0 };

// QUIZ STATS (IMPORTANT → merge with defaults)
const storedStats = loadQuizStats();

const preloadedQuizStats = storedStats
  ? { ...defaultQuizStats, ...storedStats } // ✅ merge fix
  : defaultQuizStats;

const store = configureStore({
  reducer: {
    player: playerReducer,
    sound: soundSlice,
    playerImages: playerImagesReducer,
    difficulty: difficultyReducer,
    popup: popupReducer,
    wallet: walletReducer,
    quizStats: quizStatsReducer,
    awards: awardsReducer,
    lock: lockReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),

  preloadedState: {
    wallet: preloadedWallet,
    quizStats: preloadedQuizStats,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
