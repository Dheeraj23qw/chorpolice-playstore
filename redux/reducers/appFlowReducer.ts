import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppPhase =
  | "SPLASH"
  | "ONBOARDING"
  | "LOADING"
  | "VIDEO"
  | "HOME";

interface AppFlowState {
  phase: AppPhase;
}

const initialState: AppFlowState = {
  phase: "SPLASH",
};

const appFlowSlice = createSlice({
  name: "appFlow",
  initialState,
  reducers: {
    setAppPhase: (state, action: PayloadAction<AppPhase>) => {
      state.phase = action.payload;
    },
  },
});

export const { setAppPhase } = appFlowSlice.actions;
export default appFlowSlice.reducer;
