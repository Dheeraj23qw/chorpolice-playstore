import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { storage } from "@/storage/mmkv";
import { RootState } from "@/redux/store";

const STORAGE_KEY = "AwardsState";

export interface AwardsState {
  unlocked: number[]; // IDs in the POPUP QUEUE (not yet claimed)
  earned: number[];   // IDs in the PERMANENT COLLECTION (already claimed)
}

const initialState: AwardsState = {
  unlocked: [],
  earned: [],
};

// ------------------ STORAGE HELPERS ------------------
export const loadAwards = (): AwardsState | undefined => {
  try {
    const json = storage.getString(STORAGE_KEY);
    if (!json) return undefined;
    
    const parsed = JSON.parse(json);
    // Ensure both arrays exist in the parsed object to prevent crashes
    return {
      unlocked: parsed.unlocked || [],
      earned: parsed.earned || [],
    };
  } catch (e) {
    return undefined;
  }
};

const saveAwards = (state: AwardsState) => {
  try {
    storage.set(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("❌ [Awards] Save failed", e);
  }
};

// ------------------ SLICE ------------------
const awardsSlice = createSlice({
  name: "awards",
  initialState: loadAwards() || initialState, 
  reducers: {
    addUnlocked: (state, action: PayloadAction<number[]>) => {
      // Defensive: Ensure arrays exist before we loop
      if (!state.earned) state.earned = [];
      if (!state.unlocked) state.unlocked = [];

      action.payload.forEach((id) => {
        // ONLY add to popup queue if it's NOT already earned and NOT already in queue
        const isEarned = state.earned.includes(id);
        const isUnlocked = state.unlocked.includes(id);

        if (!isEarned && !isUnlocked) {
          state.unlocked.push(id);
        }
      });
      saveAwards(state);
    },

    claimAward: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      
      // Defensive: Ensure arrays exist
      if (!state.earned) state.earned = [];
      if (!state.unlocked) state.unlocked = [];

      // 1. Remove from the "To be Shown" popup queue
      state.unlocked = state.unlocked.filter((item) => item !== id);
      
      // 2. Add to permanent collection if not already there
      if (!state.earned.includes(id)) {
        state.earned.push(id);
      }
      
      saveAwards(state);
    },

    clearUnlocked: (state) => {
      state.unlocked = [];
      saveAwards(state);
    },
    
    // Helpful for testing - Reset everything
    resetAwards: (state) => {
        state.unlocked = [];
        state.earned = [];
        saveAwards(state);
    }
  },
});

// ------------------ SELECTORS ------------------

// Use a fallback empty array in selectors for extra safety
export const selectEarnedAwards = (state: RootState) => state.awards?.earned || [];
export const selectUnclaimedAwards = (state: RootState) => state.awards?.unlocked || [];

export const hasUnclaimedAwards = (state: RootState) => {
  return (state.awards?.unlocked?.length || 0) > 0;
};

export const { addUnlocked, claimAward, clearUnlocked, resetAwards } = awardsSlice.actions;
export default awardsSlice.reducer;