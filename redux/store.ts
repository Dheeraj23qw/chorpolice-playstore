import { configureStore } from "@reduxjs/toolkit";

import awardsReducer from "@/features/awards/awardsSlice";
import gameStreakReducer, {
  initialGameStreakState,
} from "@/features/gameStreakSlice";
import quizStatsReducer, {
  defaultQuizStats,
} from "@/features/gameStats/gameStatsSlice";
import lockReducer from "@/features/locks/lockSlice";
import walletReducer from "@/features/wallet/walletSlice";
import { loadGameStreak } from "@/storage/gameStreakStorage";
import { loadLocks } from "@/storage/lockStorage";
import { loadQuizStats } from "@/storage/quizStatsStorage";
import { loadWallet } from "@/storage/walletStorage";

import { listenerMiddleware } from "./middleware";
import playerImagesReducer from "./reducers/dynamicImagesReducer";
import appFlowReducer from "./reducers/appFlowReducer";
import modalQueueReducer from "./reducers/modalQueueReducer";
import difficultyReducer from "./reducers/quiz";
import popupReducer from "./reducers/popupReducer";
import playerReducer from "./reducers/playerReducer";
import soundSlice from "./reducers/soundReducer";
import { sessionSlice } from "./reducers/sessionSlice";
import offlineSessionReducer from "./reducers/offlineSessionSlice";
import uiReducer from "./reducers/uiStateSlice";
const preloadedWallet = loadWallet() ?? { coins: 0, firstLaunch: true };
const storedStats = loadQuizStats();
const preloadedQuizStats = storedStats
  ? { ...defaultQuizStats, ...storedStats }
  : defaultQuizStats;
const preloadedGameStreak = loadGameStreak() ?? initialGameStreakState;
const preloadedLocks = loadLocks();

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
    gameStreak: gameStreakReducer,
    appFlow: appFlowReducer,
    modalQueue: modalQueueReducer,
    session: sessionSlice.reducer,
    offlineSession: offlineSessionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  preloadedState: {
    wallet: preloadedWallet,
    quizStats: preloadedQuizStats,
    gameStreak: preloadedGameStreak,
    ...(preloadedLocks ? { lock: preloadedLocks } : {}),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
