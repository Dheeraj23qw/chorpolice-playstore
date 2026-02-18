import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { AppState } from "react-native";

/* ---------------- TYPES ---------------- */

export type SoundName =
  | "win"
  | "lose"
  | "spin"
  | "next"
  | "quiz"
  | "level"
  | "select"
  | "king"
  | "timer"
  | "timesup"
  | "police";

type PlayerMap = Partial<Record<SoundName, AudioPlayer>>;
type SoundCategory = "ui" | "gameplay" | "background";

/* ---------------- CONFIG ---------------- */

// let DEBUG = __DEV__;

let DEBUG = false;

let isMutedState = false;
let exitLock = false;
let appStateSubscription: any = null;

const LOOPED_SOUNDS: SoundName[] = ["quiz", "timer"];
const SOUND_COOLDOWN = 120;

const CATEGORY_VOLUME: Record<SoundCategory, number> = {
  ui: 0.6,
  gameplay: 0.9,
  background: 0.3,
};

const QUIZ_DUCK_VOLUME = 0.1;

/* ---------------- ASSETS ---------------- */

const soundPaths: Record<SoundName, any> = {
  win: require("@/assets/audio/chorPolice/won.mp3"),
  spin: require("@/assets/audio/chorPolice/spin.mp3"),
  next: require("@/assets/audio/chorPolice/round.mp3"),
  quiz: require("@/assets/audio/chorPolice/quiz.mp3"),
  level: require("@/assets/audio/chorPolice/level.mp3"),
  select: require("@/assets/audio/chorPolice/select.mp3"),
  king: require("@/assets/audio/maingame/king.mp3"),
  police: require("@/assets/audio/maingame/police.mp3"),
  timer: require("@/assets/audio/QuizScreen/timer.mp3"),
  timesup: require("@/assets/audio/QuizScreen/timesup.mp3"),
  lose: require("@/assets/audio/chorPolice/lose.mp3"),
};

/* ---------------- INTERNAL STATE ---------------- */

const players: PlayerMap = {};
const lastPlayed: Partial<Record<SoundName, number>> = {};

let duckCounter = 0;

/* ---------------- HELPERS ---------------- */

const log = (...args: any[]) => {
  if (DEBUG) console.log("🔊 [AudioEngine]", ...args);
};

const isReady = (p?: AudioPlayer): p is AudioPlayer =>
  !!p && typeof p.play === "function";

const hardStop = (p?: AudioPlayer) => {
  if (!isReady(p)) return;
  try {
    p.pause();
    p.seekTo(0);
    p.loop = false;
  } catch {}
};

const createIfMissing = (name: SoundName) => {
  if (!players[name]) {
    players[name] = createAudioPlayer(soundPaths[name]);
    log("Created:", name);
  }
};

const duckQuiz = () => {
  const quiz = players["quiz"];
  if (!isReady(quiz)) return;

  duckCounter++;
  quiz.volume = QUIZ_DUCK_VOLUME;
};

const restoreQuizVolumeIfNeeded = () => {
  duckCounter = Math.max(0, duckCounter - 1);

  if (duckCounter === 0) {
    const quiz = players["quiz"];
    if (isReady(quiz)) {
      quiz.volume = CATEGORY_VOLUME.background;
    }
  }
};

/* ---------------- ENGINE ---------------- */

export const AudioEngine = {


  /* ---------- GLOBAL LOAD ---------- */
  loadAll() {
    // This pre-creates the players for all sounds so there's no lag when playing
    (Object.keys(soundPaths) as SoundName[]).forEach((name) => {
      createIfMissing(name);
    });
    log("All sounds pre-loaded");
  },
  /* ---------- GLOBAL QUIZ ---------- */

  ensureQuizGlobal() {
    if (isMutedState || exitLock) return;

    createIfMissing("quiz");
    const player = players["quiz"];
    if (!isReady(player)) return;

    player.loop = true;
    player.volume = CATEGORY_VOLUME.background;
    player.play();

    log("Quiz started globally");
  },

  /* ---------- CONTROL ---------- */

    isMuted() {
    return isMutedState;
  },

  setExitLock(value: boolean) {
    exitLock = value;
  },

  setMuted(value: boolean) {
    isMutedState = value;

    if (value) {
      this.forceStopAll();
    } else {
      this.ensureQuizGlobal();
    }
  },

  /* ---------- PLAY ---------- */

  play(name: SoundName, category: SoundCategory = "ui") {
    if (isMutedState || exitLock) return;

    if (name === "quiz") {
      this.ensureQuizGlobal();
      return;
    }

    createIfMissing(name);

    const now = Date.now();
    if (lastPlayed[name] && now - lastPlayed[name]! < SOUND_COOLDOWN)
      return;

    lastPlayed[name] = now;

    const player = players[name];
    if (!isReady(player)) return;

    hardStop(player);

    player.loop = LOOPED_SOUNDS.includes(name);
    player.volume = CATEGORY_VOLUME[category];

    duckQuiz();

    player.play();
    log("Playing:", name);
  },

  /* ---------- STOP ---------- */

  stop(name: SoundName) {
    if (name === "quiz") return;

    const player = players[name];
    if (!isReady(player)) return;

    hardStop(player);
    restoreQuizVolumeIfNeeded();

    log("Stopped:", name);
  },

  stopAllExceptQuiz() {
    Object.keys(players).forEach((key) => {
      const name = key as SoundName;
      if (name === "quiz") return;

      hardStop(players[name]);
    });

    duckCounter = 0;
    restoreQuizVolumeIfNeeded();

    log("Stopped all except quiz");
  },

  forceStopAll() {
    Object.keys(players).forEach((key) => {
      hardStop(players[key as SoundName]);
    });

    duckCounter = 0;
    log("Force stopped ALL sounds");
  },

  /* ---------- BACKGROUND ---------- */

  enableBackgroundProtection() {
    if (appStateSubscription) return;

    appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        this.stopAllExceptQuiz();
      } else {
        this.ensureQuizGlobal();
      }
    });
  },
};
