// features/awards/awardsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { storage } from "@/storage/mmkv";
import { RootState } from "@/redux/store";

const STORAGE_KEY = "AwardsState";

export interface AwardsState {
  unlocked: number[]; // IDs of awards unlocked but not yet claimed
}

const initialState: AwardsState = {
  unlocked: [],
};

// ------------------ STORAGE HELPERS ------------------
export const loadAwards = (): AwardsState | undefined => {
  try {
    const json = storage.getString(STORAGE_KEY);
    return json ? JSON.parse(json) : undefined;
  } catch (e) {
    console.error("❌ [Awards] Load failed", e);
    return undefined;
  }
};

export const saveAwards = (state: AwardsState) => {
  try {
    storage.set(STORAGE_KEY, JSON.stringify(state));
    if (__DEV__) console.log("💾 [Awards] Saved successfully");
  } catch (e) {
    console.error("❌ [Awards] Save failed", e);
  }
};

// ------------------ SLICE ------------------
const awardsSlice = createSlice({
  name: "awards",
  initialState,
  reducers: {
    setAwards: (_, action: PayloadAction<AwardsState>) => {
      saveAwards(action.payload);
      return action.payload;
    },

    addUnlocked: (state, action: PayloadAction<number[]>) => {
      action.payload.forEach((id) => {
        if (!state.unlocked.includes(id)) state.unlocked.push(id);
      });
      saveAwards(state);
    },

    claimAward: (state, action: PayloadAction<number>) => {
      state.unlocked = state.unlocked.filter((id) => id !== action.payload);
      saveAwards(state);
    },

    clearUnlocked: (state) => {
      state.unlocked = [];
      saveAwards(state);
    },
  },
});

export const selectUnclaimedAwards = (state: RootState) => state.awards.unlocked;

export const hasUnclaimedAwards = (state: RootState) => {
  const remaining = state.awards.unlocked.length;
  console.log("🎯 [Awards Debug] Unclaimed awards left:", remaining, state.awards.unlocked);
  return remaining > 0;
};

export const { setAwards, addUnlocked, claimAward, clearUnlocked } = awardsSlice.actions;

export default awardsSlice.reducer;
