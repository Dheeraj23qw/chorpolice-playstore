import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Audio } from "expo-av";

// Define sound names
type SoundName =
  | "win"
  | "lose"
  | "spin"
  | "next"
  | "quiz"
  | "level"
  | "start"
  | "select"
  | "selected"
  | "king"
  | "police"
  | "thief";

// Define paths to your sound files
const soundPaths: Record<SoundName, any> = {
  win: require("@/assets/audio/chorPolice/won.mp3"),
  lose: require("@/assets/audio/QuizScreen/wrong.mp3"),
  spin: require("@/assets/audio/chorPolice/spin.mp3"),
  next: require("@/assets/audio/chorPolice/round.mp3"),
  quiz: require("@/assets/audio/chorPolice/quiz.mp3"),
  level: require("@/assets/audio/chorPolice/level.mp3"),
  start: require("@/assets/audio/chorPolice/start.mp3"),
  select: require("@/assets/audio/chorPolice/select.mp3"),
  selected: require("@/assets/audio/chorPolice/selected.mp3"),
  king: require("@/assets/audio/maingame/king.mp3"),
  police: require("@/assets/audio/maingame/police.mp3"),
  thief: require("@/assets/audio/maingame/thief.mp3"),
};

// Object to store loaded sounds
const sounds: Record<SoundName, Audio.Sound | null> = {
  win: null,
  lose: null,
  spin: null,
  next: null,
  quiz: null,
  level: null,
  start: null,
  select: null,
  selected: null,
  king: null,
  police: null,
  thief: null,
};

// Thunk to load sounds asynchronously with error handling
export const loadSounds = createAsyncThunk(
  "sound/loadSounds",
  async (_, { rejectWithValue }) => {
    try {
      for (const key of Object.keys(soundPaths) as SoundName[]) {
        const { sound } = await Audio.Sound.createAsync(soundPaths[key]);
        sounds[key] = sound;
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

type SoundState = {
  isLoading: boolean;
  error: string | null;
};

const initialState: SoundState = {
  isLoading: false,
  error: null,
};

const soundSlice = createSlice({
  name: "sound",
  initialState,
  reducers: {
  playSound: (state, action) => {
  const soundName: SoundName = action.payload;
  const sound = sounds[soundName];
  if (sound) {
    // Reset looping if it's the quiz sound
    if (soundName === "quiz") {
      sound.setIsLoopingAsync(true).catch((error: unknown) => {
        console.error(`Failed to set loop for quiz sound:`, (error as Error).message);
      });
    }

    // Stop the sound before replaying
    sound.stopAsync().catch((error: unknown) => {
      console.error(`Failed to stop sound ${soundName}:`, (error as Error).message);
    });

    // Replay the sound after stopping it
    sound.replayAsync().catch((error: unknown) => {
      console.error(`Failed to play sound ${soundName}:`, (error as Error).message);
    });
  } else {
    console.warn(`Sound ${soundName} is not loaded.`);
  }
},
    stopQuizSound: () => {
      const quizSound = sounds.quiz;
      if (quizSound) {
        quizSound.stopAsync().catch((error: unknown) => {
          console.error("Failed to stop quiz sound:", (error as Error).message);
        });
      }
    },
    unloadSounds: () => {
      Object.values(sounds).forEach((sound) => {
        if (sound) {
          sound.unloadAsync().catch((error: unknown) => {
            console.error("Failed to unload sound:", (error as Error).message);
          });
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSounds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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

export const { playSound, stopQuizSound, unloadSounds } = soundSlice.actions;

export default soundSlice.reducer;
