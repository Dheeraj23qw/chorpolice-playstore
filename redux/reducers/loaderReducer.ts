import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoaderState {
  activeRequests: number;
  visible: boolean;
  message: string;
}

const initialState: LoaderState = {
  activeRequests: 0,
  visible: false,
  message: "Loading...",
};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    showLoader: (state, action: PayloadAction<string | undefined>) => {
      state.activeRequests += 1;
      state.visible = true;
      state.message = action.payload ?? "Loading...";
    },

    hideLoader: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      state.visible = state.activeRequests > 0;
    },

    resetLoader: (state) => {
      state.activeRequests = 0;
      state.visible = false;
    },
  },
});

export const { showLoader, hideLoader, resetLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
