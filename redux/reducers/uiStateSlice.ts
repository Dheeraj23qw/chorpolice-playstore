import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface UIState {
  isModalOpen: boolean;
}

const initialState: UIState = {
  isModalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModalUI: (state) => {
      state.isModalOpen = true;
    },
    closeModalUI: (state) => {
      state.isModalOpen = false;
    },
    setModalUI: (state, action) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const { openModalUI, closeModalUI } = uiSlice.actions;

/* 🔥 Your simple selector */
export const selectIsModalOpenUI = (state: RootState) => state.ui.isModalOpen;

export default uiSlice.reducer;
