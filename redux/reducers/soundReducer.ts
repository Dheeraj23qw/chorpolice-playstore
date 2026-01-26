import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createAudioPlayer } from "expo-audio";

// Sound Names
type SoundName =
  | "win" | "lose" | "spin" | "next" | "quiz" | "level"
  | "select" | "selected" | "king" | "timer" | "timesup"
  | "police" | "winning" | "losing";

const soundPaths: Record<SoundName, any> = {
  win: require("@/assets/audio/chorPolice/won.mp3"),
  lose: require("@/assets/audio/QuizScreen/wrong.mp3"),
  spin: require("@/assets/audio/chorPolice/spin.mp3"),
  next: require("@/assets/audio/chorPolice/round.mp3"),
  quiz: require("@/assets/audio/chorPolice/quiz.mp3"),
  level: require("@/assets/audio/chorPolice/level.mp3"),
  select: require("@/assets/audio/chorPolice/select.mp3"),
  selected: require("@/assets/audio/chorPolice/selected.mp3"),
  king: require("@/assets/audio/maingame/king.mp3"),
  police: require("@/assets/audio/maingame/police.mp3"),
  timer: require("@/assets/audio/QuizScreen/timer.mp3"),
  timesup: require("@/assets/audio/QuizScreen/timesup.mp3"),
  winning: require("@/assets/audio/chorPolice/winning.mp3"),
  losing: require("@/assets/audio/chorPolice/losing.mp3"),
};

// Global object to store players outside the state
const players: Record<string, any> = {};

/** * SAFETY CHECK: 
 * Ensures the player is loaded and not released before use
 */
const isPlayerReady = (name: string) => {
  const p = players[name];
  // We check if the player exists and hasn't been destroyed
  return p && typeof p.play === "function";
};

export const loadSounds = createAsyncThunk(
  "sound/loadSounds",
  async (_, { rejectWithValue }) => {
    try {
      (Object.keys(soundPaths) as SoundName[]).forEach((key) => {
        // Create player if it doesn't exist
        if (!players[key]) {
          players[key] = createAudioPlayer(soundPaths[key]);
        }
      });
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const soundSlice = createSlice({
  name: "sound",
  initialState: {
    isLoading: false,
    error: null as string | null,
    isMuted: false,
  },
  reducers: {
    playSound: (state, action) => {
      const name: SoundName = action.payload;
      
      if (isPlayerReady(name)) {
        const player = players[name];

        // Handle simple loops
        if (name === "quiz" || name === "timer") {
          player.loop = true;
        }

        // Only try to seek if the player is ready
        try {
          player.seekTo(0); 
          player.play();
        } catch (e) {
          console.log(`Audio error for ${name}:`, e);
        }
      }
    },

    stopSound: (state, action) => {
      const name: SoundName = action.payload;
      if (isPlayerReady(name)) {
        players[name].pause();
        try { players[name].seekTo(0); } catch (e) {}
      }
    },

    stopQuizSound: (state) => {
      if (isPlayerReady("quiz")) {
        players.quiz.pause();
        try { players.quiz.seekTo(0); } catch (e) {}
      }
      state.isMuted = true;
    },

    stopTimerSound: () => {
      if (isPlayerReady("timer")) {
        players.timer.pause();
        try { players.timer.seekTo(0); } catch (e) {}
      }
    },

    unloadSounds: () => {
      Object.keys(players).forEach((key) => {
        try {
          players[key]?.pause();
          // Important: check release before calling
          players[key]?.release();
        } catch (e) {
          console.log("Error unloading sound:", key);
        }
        delete players[key];
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSounds.pending, (state) => { state.isLoading = true; })
      .addCase(loadSounds.fulfilled, (state) => { state.isLoading = false; })
      .addCase(loadSounds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  playSound,
  stopQuizSound,
  stopTimerSound,
  unloadSounds,
  stopSound,
} = soundSlice.actions;

export default soundSlice.reducer;