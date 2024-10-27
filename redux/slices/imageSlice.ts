import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ImageState {
  selectedImages: string[]; // Array to hold the URIs of the selected images
}

const initialState: ImageState = {
  selectedImages: [], // Initialize with an empty array
};

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setSelectedImages: (state, action: PayloadAction<string[]>) => {
      state.selectedImages = action.payload;
    },
    resetSelectedImages: (state) => {
      state.selectedImages = [];
    },
  },
});

export const { setSelectedImages, resetSelectedImages } = imagesSlice.actions;

export default imagesSlice.reducer;
