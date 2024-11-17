// botSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface BotState {
  isThinking: boolean;
}

const initialState: BotState = {
  isThinking: false,
};

const botSlice = createSlice({
  name: "bot",
  initialState,
  reducers: {
    setIsThinking: (state, action) => {
      state.isThinking = action.payload;
    },
  },
});

export const { setIsThinking } = botSlice.actions;
export default botSlice.reducer;
