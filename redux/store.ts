// store.ts
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./reducers/playerReducer";
import soundSlice from "./reducers/soundReducer";
import playerImagesReducer from "./reducers/dynamicImagesReducer";
import gameReducer from "@/redux/reducers/gameReducer";
import botReducer from "@/redux/reducers/botReducer";
import difficultyReducer from "@/redux/reducers/quiz";
import coinsReducer from "@/redux/reducers/coinsReducer";
const store = configureStore({
  reducer: {
    player: playerReducer,
    sound: soundSlice,
    bot: botReducer,
    playerImages: playerImagesReducer,
    game: gameReducer,
    difficulty: difficultyReducer,
    coins: coinsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
