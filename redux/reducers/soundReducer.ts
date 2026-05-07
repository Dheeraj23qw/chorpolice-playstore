// soundSlice.ts
import { AudioEngine } from "@/audio/audioEngine";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loadQuizNarrationEnabled, saveQuizNarrationEnabled } from "@/storage/settingsStorage";

interface SoundState {
  isLoading: boolean;
  isLoaded: boolean;
  isMuted: boolean;
  quizNarrationEnabled: boolean;
}

const initialState: SoundState = {
  isLoading: false,
  isLoaded: false,
  isMuted: false,
  quizNarrationEnabled: loadQuizNarrationEnabled(),
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
    toggleQuizNarration: (state) => {
      state.quizNarrationEnabled = !state.quizNarrationEnabled;
      saveQuizNarrationEnabled(state.quizNarrationEnabled);
    },
    setQuizNarrationEnabled: (state, action) => {
      state.quizNarrationEnabled = action.payload;
      saveQuizNarrationEnabled(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSounds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSounds.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoaded = true;
      })
      .addCase(loadSounds.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setMuted, toggleQuizNarration, setQuizNarrationEnabled } = soundSlice.actions;
export default soundSlice.reducer;
