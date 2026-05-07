// soundSlice.ts
import { AudioEngine } from "@/audio/audioEngine";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loadQuizNarrationEnabled,
  saveQuizNarrationEnabled,
  loadQuizNarrationVoiceId,
  saveQuizNarrationVoiceId,
  loadQuizNarrationRate,
  saveQuizNarrationRate,
  loadQuizNarrationPitch,
  saveQuizNarrationPitch,
} from "@/storage/settingsStorage";

interface SoundState {
  isLoading: boolean;
  isLoaded: boolean;
  isMuted: boolean;
  quizNarrationEnabled: boolean;
  quizNarrationVoiceId?: string;
  quizNarrationRate: number;
  quizNarrationPitch: number;
}

const initialState: SoundState = {
  isLoading: false,
  isLoaded: false,
  isMuted: false,
  quizNarrationEnabled: loadQuizNarrationEnabled(),
  quizNarrationVoiceId: loadQuizNarrationVoiceId(),
  quizNarrationRate: loadQuizNarrationRate(),
  quizNarrationPitch: loadQuizNarrationPitch(),
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
    setQuizNarrationVoiceId: (state, action) => {
      state.quizNarrationVoiceId = action.payload;
      saveQuizNarrationVoiceId(action.payload);
    },
    setQuizNarrationRate: (state, action) => {
      state.quizNarrationRate = action.payload;
      saveQuizNarrationRate(action.payload);
    },
    setQuizNarrationPitch: (state, action) => {
      state.quizNarrationPitch = action.payload;
      saveQuizNarrationPitch(action.payload);
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

export const {
  setMuted,
  toggleQuizNarration,
  setQuizNarrationEnabled,
  setQuizNarrationVoiceId,
  setQuizNarrationRate,
  setQuizNarrationPitch,
} = soundSlice.actions;

export default soundSlice.reducer;
