import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of your player images
interface PlayerImage {
  type: string;
  src: string | any; // Update the type as needed based on your src
}

interface PlayerImagesState {
  images: { [key: number]: PlayerImage };
}

const initialState: PlayerImagesState = {
  images: {
    1: { type: "local", src: require("@/assets/images/chorsipahi/kid1.png") },
    2: { type: "local", src: require("@/assets/images/chorsipahi/kid2.png") },
    3: { type: "local", src: require("@/assets/images/chorsipahi/kid3.png") },
    4: { type: "local", src: require("@/assets/images/chorsipahi/kid4.png") },
    5: { type: "local", src: require("@/assets/images/chorsipahi/kid5.png") },
    6: { type: "local", src: require("@/assets/images/chorsipahi/kid6.png") },
    7: { type: "local", src: require("@/assets/images/chorsipahi/kid7.png") },
    8: { type: "local", src: require("@/assets/images/chorsipahi/kid8.png") },
    9: { type: "local", src: require("@/assets/images/chorsipahi/kid9.png") },
    10: { type: "local", src: require("@/assets/images/chorsipahi/kid10.png") },
    11: { type: "local", src: require("@/assets/images/chorsipahi/kid11.png") },
    12: { type: "local", src: require("@/assets/images/chorsipahi/kid12.png") },
    13: { type: "local", src: require("@/assets/images/chorsipahi/kid13.png") },
    14: { type: "local", src: require("@/assets/images/chorsipahi/kid14.png") },
    15: { type: "local", src: require("@/assets/images/chorsipahi/kid15.png") },
    16: { type: "local", src: require("@/assets/images/chorsipahi/kid16.png") },
    17: { type: "local", src: require("@/assets/images/chorsipahi/kid17.png") },
    18: { type: "local", src: require("@/assets/images/chorsipahi/kid18.png") },
    19: { type: "local", src: require("@/assets/images/chorsipahi/kid19.png") },
    20: { type: "local", src: require("@/assets/images/chorsipahi/kid20.png") },
    21: { type: "local", src: require("@/assets/images/chorsipahi/kid21.png") },
    22: { type: "local", src: require("@/assets/images/chorsipahi/kid22.png") },
    23: { type: "local", src: require("@/assets/images/chorsipahi/kid23.png") },
    24: { type: "local", src: require("@/assets/images/chorsipahi/kid24.png") },
    25: { type: "local", src: require("@/assets/images/chorsipahi/kid25.png") },
    26: { type: "local", src: require("@/assets/images/chorsipahi/kid26.png") },
    27: { type: "local", src: require("@/assets/images/chorsipahi/kid27.png") },
    28: { type: "local", src: require("@/assets/images/chorsipahi/kid28.png") },
    29: { type: "local", src: require("@/assets/images/chorsipahi/kid29.png") },
    30: { type: "local", src: require("@/assets/images/chorsipahi/kid30.png") },
    31: { type: "local", src: require("@/assets/images/chorsipahi/kid31.png") },
    32: {
      type: "gallery",
      src: "https://static.wikia.nocookie.net/naruto/images/d/dc/Naruto%27s_Sage_Mode.png/revision/latest/scale-to-width-down/985?cb=20150124180545",
    },
    33: {
      type: "gallery",
      src: "https://static.wikia.nocookie.net/naruto/images/d/dc/Naruto%27s_Sage_Mode.png/revision/latest/scale-to-width-down/985?cb=20150124180545",
    },
    34: {
      type: "gallery",
      src: "https://static.wikia.nocookie.net/naruto/images/d/dc/Naruto%27s_Sage_Mode.png/revision/latest/scale-to-width-down/985?cb=20150124180545",
    },
    35: {
      type: "gallery",
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQihK1GY1rv2V0Di2INYm81aN-RkAZXTnyyw&shttps://store-images.s-microsoft.com/image/apps.39852.14455250034361967.824623c3-91b6-402f-9a68-c66bfac9bc20.7bfae929-5b2a-4efe-9639-5ffd1e2de297?q=90&w=480&h=270://static.wikia.nocookie.net/naruto/images/d/dc/Naruto%27s_Sage_Mode.png/revision/latest/scale-to-width-down/985?cb=20150124180545",
    },

    36: { type: "local", src: require("@/assets/images/chorsipahi/kid32.png") },
    37: { type: "local", src: require("@/assets/images/chorsipahi/kid33.png") },
    38: { type: "local", src: require("@/assets/images/chorsipahi/kid34.png") },
    39: { type: "local", src: require("@/assets/images/chorsipahi/kid35.png") },
    40: { type: "local", src: require("@/assets/images/chorsipahi/kid36.png") },
  },
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
