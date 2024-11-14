// store.ts
import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './reducers/playerReducer'
import soundSlice from './reducers/soundReducer';
// import imagesReducer  from '@/redux/slices/imageSlice'
import playerImagesReducer from './reducers/dynamicImagesReducer'
import gameReducer from "@/redux/reducers/gameReducer"
const store = configureStore({
  reducer: {
    player: playerReducer,
    sound: soundSlice,
    // images: imagesReducer, 
    playerImages: playerImagesReducer,
    game: gameReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;