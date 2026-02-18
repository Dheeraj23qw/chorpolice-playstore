// soundSlice.ts
import { AudioEngine } from "@/audio/audioEngine";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface SoundState {
  isLoading: boolean;
  isMuted: boolean;
}

const initialState: SoundState = {
  isLoading: false,
  isMuted: false,
};

export const loadSounds = createAsyncThunk(
  "sound/load",
  async (_, { rejectWithValue }) => {
    try {
      AudioEngine.loadAll();
      AudioEngine.enableBackgroundProtection();
    } catch (e) {
      return rejectWithValue("Audio load failed");
    }
  }
);


const soundSlice = createSlice({
  name: "sound",
  initialState,
  reducers: {
    setMuted: (state, action) => {
      state.isMuted = action.payload;
      AudioEngine.setMuted(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSounds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSounds.fulfilled, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setMuted } = soundSlice.actions;
export default soundSlice.reducer;
