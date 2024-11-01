import { playerImages } from "@/constants/playerData";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of your player images
interface PlayerImage {
  type: string;
  src: string; // Update the type as needed based on your src
}

interface PlayerImagesState {
  images: { [key: number]: PlayerImage };
}

const initialState: PlayerImagesState = {
  images: playerImages,
};

// Create a slice
const playerImagesSlice = createSlice({
  name: "playerImages",
  initialState,
  reducers: {
    addImage(
      state,
      action: PayloadAction<{ type: string; src: string | any }>
    ) {
      // Generate new ID based on the current length of the images object
      const newId = Object.keys(state.images).length + 1;
      state.images[newId] = {
        type: action.payload.type,
        src: action.payload.src,
      };
    },
  },
});

// Export the action
export const { addImage } = playerImagesSlice.actions;

// Export the reducer
export default playerImagesSlice.reducer;
