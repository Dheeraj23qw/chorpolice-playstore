import { createSlice } from "@reduxjs/toolkit";

interface GameStreakState {
  currentStreak: number;
  highestStreak: number;
  lastActiveDate: string | null;
}

const initialState: GameStreakState = {
  currentStreak: 0,
  highestStreak: 0,
  lastActiveDate: null,
};

const gameStreakSlice = createSlice({
  name: "gameStreak",
  initialState,
  reducers: {
    updateStreak: (state) => {
      const today = new Date().toISOString().split("T")[0];
      const lastDate = state.lastActiveDate;

      if (!lastDate) {
        state.currentStreak = 1;
      } else if (lastDate !== today) {
        const todayDate = new Date(today);
        const lastPlayed = new Date(lastDate);

        const diffDays =
          (todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          state.currentStreak += 1;
        } else if (diffDays > 1) {
          state.currentStreak = 1;
        }
      }

      state.lastActiveDate = today;

      if (state.currentStreak > state.highestStreak) {
        state.highestStreak = state.currentStreak;
      }
    },

    resetStreak: () => initialState,
  },
});

export const { updateStreak, resetStreak } = gameStreakSlice.actions;
export default gameStreakSlice.reducer;
