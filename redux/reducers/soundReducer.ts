import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createAudioPlayer, AudioSource } from "expo-audio";

// Define sound names
type SoundName =
  | "win"
  | "lose"
  | "spin"
  | "next"
  | "quiz"
  | "level"
  | "select"
  | "selected"
  | "king"
  | "timer"
  | "timesup"
  | "police"
  | "winning"
  | "losing";

// Define paths to your sound files
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


const players: Record<string, any> = {};

export const loadSounds = createAsyncThunk(
  "sound/loadSounds",
  async (_, { rejectWithValue }) => {
    try {
      for (const key of Object.keys(soundPaths) as SoundName[]) {
        // In expo-audio, we create a player for each source
        players[key] = createAudioPlayer(soundPaths[key]);
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

type SoundState = {
  isLoading: boolean;
  error: string | null;
  isMuted: boolean;
};

const initialState: SoundState = {
  isLoading: false,
  error: null,
  isMuted: false,
};

const soundSlice = createSlice({
  name: "sound",
  initialState,
  reducers: {
    playSound: (state, action) => {
      const soundName: SoundName = action.payload;
      const player = players[soundName];

      if (player) {
        // Handle looping for specific sounds
        if (soundName === "quiz" || soundName === "timer") {
          player.loop = true;
          if (soundName === "quiz") state.isMuted = false;
        }

        // Restart and play
        player.seekTo(0); // Equivalent to stop/replay
        player.play();
      } else {
        console.warn(`Sound ${soundName} is not loaded.`);
      }
    },
    stopSound: (state, action) => {
      const soundName: SoundName = action.payload;
      const player = players[soundName];
      if (player) {
        player.pause(); // expo-audio uses play/pause
        player.seekTo(0);
      }
    },
    stopQuizSound: (state) => {
      if (players.quiz) {
        players.quiz.pause();
        players.quiz.seekTo(0);
      }
      state.isMuted = true;
    },
    stopTimerSound: () => {
      if (players.timer) {
        players.timer.pause();
        players.timer.seekTo(0);
      }
    },
    unloadSounds: () => {
      Object.keys(players).forEach((key) => {
        players[key]?.release(); // Release resources
        delete players[key];
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSounds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSounds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loadSounds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to load sounds";
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
