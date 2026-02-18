import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./reducers/playerReducer";
import soundSlice from "./reducers/soundReducer";
import playerImagesReducer from "./reducers/dynamicImagesReducer";
import difficultyReducer from "@/redux/reducers/quiz";
import loaderReducer from "./reducers/loaderReducer";
import popupReducer from "./reducers/popupReducer";
import awardsReducer from "@/features/awards/awardsSlice";
// import alertsReducer from "@/features/alerts/alertSlice"
import walletReducer, { loadWallet, WalletState } from "@/features/wallet/walletSlice";
import quizStatsReducer, { loadQuizStats } from "@/features/quizStats/quizStatsSlice";
import { QuizStatsState } from "@/features/quizStats/quizStatsTypes";
import { listenerMiddleware } from "./middleware"; 

const preloadedWallet = loadWallet();
const preloadedQuizStats = loadQuizStats();

const store = configureStore({
  reducer: {
    player: playerReducer,
    sound: soundSlice,
    playerImages: playerImagesReducer,
    difficulty: difficultyReducer,
    loader: loaderReducer,
    popup: popupReducer,
    wallet: walletReducer,
    quizStats: quizStatsReducer,
    awards: awardsReducer,
    // alerts: alertsReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  
  preloadedState: {
    wallet: preloadedWallet as WalletState,
    quizStats: preloadedQuizStats as QuizStatsState,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;