import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk"; // Import thunk middleware
import playerReducer from "./reducers/playerReducer";
import soundSlice from "./reducers/soundReducer";
import playerImagesReducer from "./reducers/dynamicImagesReducer";
import botReducer from "@/redux/reducers/botReducer";
import difficultyReducer from "@/redux/reducers/quiz";
import coinsReducer from "@/redux/reducers/coinsReducer";

const store = configureStore({
  reducer: {
    player: playerReducer,
    sound: soundSlice,
    bot: botReducer,
    playerImages: playerImagesReducer,
    difficulty: difficultyReducer,
    coins: coinsReducer,
  },
  // Include thunk middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // Thunk is enabled by default in Redux Toolkit
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
