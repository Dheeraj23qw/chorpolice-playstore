// store.ts
import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice'
import soundSlice from './slices/soundSlice';
import imagesReducer  from '@/redux/slices/imageSlice'
import playerImagesReducer from './slices/dynamicImagesSlice'

const store = configureStore({
  reducer: {
    player: playerReducer,
    sound: soundSlice,
    images: imagesReducer, 
    playerImages: playerImagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;