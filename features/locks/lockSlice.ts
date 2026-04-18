import { createSlice } from "@reduxjs/toolkit";

interface LockState {
  spin: {
    lastUsedTimestamp: number | null;
    countToday: number;
  };
  daily_bonus: {
    lastUsedTimestamp: number | null;
    countToday: number;
  };
  rate_us: {
    hasRated: boolean;
    lastPrompted: number | null;
  };
}

const initialState: LockState = {
  spin: { lastUsedTimestamp: null, countToday: 0 },
  daily_bonus: { lastUsedTimestamp: null, countToday: 0 },
  rate_us: { hasRated: false, lastPrompted: null },
};

const lockSlice = createSlice({
  name: "lock", // ✅ renamed
  initialState,

  reducers: {
    useSpin: (state) => {
      state.spin.lastUsedTimestamp = Date.now();
      state.spin.countToday += 1;
    },

    claimDailyBonus: (state) => {
      state.daily_bonus.lastUsedTimestamp = Date.now();
      state.daily_bonus.countToday += 1;
    },

    markRated: (state) => {
      state.rate_us.hasRated = true;
    },

    resetLocks: () => initialState, // ✅ renamed action
  },
});

export const { useSpin, claimDailyBonus, markRated, resetLocks } =
  lockSlice.actions;

export default lockSlice.reducer;
