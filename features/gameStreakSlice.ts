import { createSlice } from "@reduxjs/toolkit";

export interface GameStreakState {
  currentStreak: number;
  highestStreak: number;
  lastActiveDate: string | null;
}

export const initialGameStreakState: GameStreakState = {
  currentStreak: 0,
  highestStreak: 0,
  lastActiveDate: null,
};

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const gameStreakSlice = createSlice({
  name: "gameStreak",
  initialState: initialGameStreakState,
  reducers: {
    updateStreak: (state) => {
      const today = toLocalDateKey(new Date());
      const lastDate = state.lastActiveDate;

      if (!lastDate) {
        state.currentStreak = 1;
      } else if (lastDate !== today) {
        const todayDate = new Date(`${today}T00:00:00`);
        const lastPlayed = new Date(`${lastDate}T00:00:00`);

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

    resetStreak: () => initialGameStreakState,
  },
});

export const { updateStreak, resetStreak } = gameStreakSlice.actions;
export default gameStreakSlice.reducer;
