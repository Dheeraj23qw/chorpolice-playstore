import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./reducers/playerReducer";
import soundSlice from "./reducers/soundReducer";
import playerImagesReducer from "./reducers/dynamicImagesReducer";
import difficultyReducer from "@/redux/reducers/quiz";
import loaderReducer from "./reducers/loaderReducer";
import popupReducer from "./reducers/popupReducer";
import walletReducer from "@/features/wallet/walletSlice";
import quizStatsReducer from "@/features/quizStats/quizStatsSlice";

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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
