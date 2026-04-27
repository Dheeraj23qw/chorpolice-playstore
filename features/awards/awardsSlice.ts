import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { storage } from "@/storage/mmkv";
import { RootState } from "@/redux/store";

const STORAGE_KEY = "AwardsState";

interface AwardsState {
  unlocked: number[]; // IDs in the POPUP QUEUE (not yet claimed)
  earned: number[];   // IDs in the PERMANENT COLLECTION (already claimed)
}

const initialState: AwardsState = {
  unlocked: [],
  earned: [],
};

// ------------------ STORAGE HELPERS ------------------
const loadAwards = (): AwardsState | undefined => {
  try {
    const json = storage.getString(STORAGE_KEY);
    if (!json) return undefined;
    
    const parsed = JSON.parse(json);
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
      if (!state.earned) state.earned = [];
      if (!state.unlocked) state.unlocked = [];

      action.payload.forEach((id) => {
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
      
      if (!state.earned) state.earned = [];
      if (!state.unlocked) state.unlocked = [];

      state.unlocked = state.unlocked.filter((item) => item !== id);
      
      if (!state.earned.includes(id)) {
        state.earned.push(id);
      }
      
      saveAwards(state);
    },

    clearUnlocked: (state) => {
      state.unlocked = [];
      saveAwards(state);
    },
    
    resetAwards: (state) => {
        state.unlocked = [];
        state.earned = [];
        saveAwards(state);
    }
  },
});

// ------------------ SELECTORS ------------------

export const selectEarnedAwards = (state: RootState) => state.awards?.earned || [];

export const { addUnlocked, claimAward } = awardsSlice.actions;
export default awardsSlice.reducer;