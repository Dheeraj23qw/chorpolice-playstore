import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createAudioPlayer, AudioPlayer } from "expo-audio";

/* ----------------------------- TYPES ----------------------------- */

export type SoundName =
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

type PlayerMap = Partial<Record<SoundName, AudioPlayer>>;

/* --------------------------- ASSETS --------------------------- */

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

/* ------------------------ INTERNAL ENGINE ------------------------ */

const players: PlayerMap = {};
const LOOPED_SOUNDS: SoundName[] = ["quiz", "timer"];

/** Type Guard */
const isReady = (p: AudioPlayer | undefined): p is AudioPlayer => {
  return !!p && typeof p.play === "function";
};

/** Hard stop helper */
const hardStop = (p?: AudioPlayer) => {
  if (!isReady(p)) return;

  try {
    p.pause();
    p.loop = false;
    p.seekTo(0);
  } catch {
    // silent
  }
};

/** Safe release helper */
const safeRelease = (p?: AudioPlayer) => {
  if (!isReady(p)) return;

  try {
    hardStop(p);
    p.release();
  } catch {
    // silent
  }
};

/* -------------------------- ASYNC LOAD -------------------------- */

export const loadSounds = createAsyncThunk(
  "sound/load",
  async (_, { rejectWithValue }) => {
    try {
      (Object.keys(soundPaths) as SoundName[]).forEach((name) => {
        if (!players[name]) {
          players[name] = createAudioPlayer(soundPaths[name]);
        }
      });
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

/* ---------------------------- SLICE ---------------------------- */

interface SoundState {
  isLoading: boolean;
  error: string | null;
  isMuted: boolean;
}

const initialState: SoundState = {
  isLoading: false,
  error: null,
  isMuted: false,
};

const soundSlice = createSlice({
  name: "sound",
  initialState,
  reducers: {
    /* ▶️ PLAY */
    playSound: (state, action: PayloadAction<SoundName>) => {
      if (state.isMuted) return;

      const name = action.payload;
      const player = players[name];

      if (!isReady(player)) return;

      try {
        // HARD RESET BEFORE PLAY (prevents overlaps & lag)
        hardStop(player);

        // Loop control
        player.loop = LOOPED_SOUNDS.includes(name);

        player.play();
      } catch (e) {
        console.warn(`Audio play failed for ${name}`, e);
      }
    },

    /* ⏹ STOP SINGLE */
    stopSound: (_, action: PayloadAction<SoundName>) => {
      hardStop(players[action.payload]);
    },

    /* ⛔ STOP QUIZ */
    stopQuizSound: () => {
      hardStop(players.quiz);
    },

    /* ⏱ STOP TIMER */
    stopTimerSound: () => {
      hardStop(players.timer);
    },

    /* 🔊 MUTE CONTROL */
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;

      if (action.payload) {
        Object.values(players).forEach(hardStop);
      }
    },

    /* 🧹 FULL CLEANUP */
    unloadSounds: () => {
      (Object.keys(players) as SoundName[]).forEach((key) => {
        safeRelease(players[key]);
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
        state.error = action.payload as string;
      });
  },
});

/* --------------------------- EXPORTS --------------------------- */

export const {
  playSound,
  stopSound,
  stopQuizSound,
  stopTimerSound,
  unloadSounds,
  setMuted,
} = soundSlice.actions;

export default soundSlice.reducer;
