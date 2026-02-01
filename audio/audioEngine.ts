// audioEngine.ts
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { AppState } from "react-native";

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

type SoundCategory = "ui" | "gameplay" | "background";

/* --------------------------- CONFIG --------------------------- */

// auto true in dev, false in production
let DEBUG = __DEV__;

export const setAudioDebug = (value: boolean) => {
  DEBUG = value;
};

const LOOPED_SOUNDS: SoundName[] = ["quiz", "timer"];

const SOUND_COOLDOWN = 120; // prevent spam taps

const CATEGORY_VOLUME: Record<SoundCategory, number> = {
  ui: 0.6,
  gameplay: 0.9,
  background: 0.5,
};

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

/* ------------------------ INTERNAL STATE ------------------------ */

const players: PlayerMap = {};
const lastPlayed: Partial<Record<SoundName, number>> = {};

let isMuted = false;
let appStateSubscription: any = null;

/* ------------------------ INTERNAL HELPERS ------------------------ */

const log = (...args: any[]) => {
  if (DEBUG) console.log("🔊 [AudioEngine]", ...args);
};

const isReady = (p?: AudioPlayer): p is AudioPlayer =>
  !!p && typeof p.play === "function";

const hardStop = (p?: AudioPlayer) => {
  if (!isReady(p)) return;
  try {
    p.pause();
    p.loop = false;
    p.seekTo(0);
  } catch {}
};

const stopAllLoops = () => {
  LOOPED_SOUNDS.forEach((name) => hardStop(players[name]));
};

const createIfMissing = (name: SoundName) => {
  if (!players[name]) {
    players[name] = createAudioPlayer(soundPaths[name]);
    log("Created player:", name);
  }
};

/* ------------------------ PUBLIC ENGINE ------------------------ */

export const AudioEngine = {
  loadAll() {
    Object.keys(soundPaths).forEach((key) => {
      const name = key as SoundName;
      createIfMissing(name);

      // Warm-up to remove first-play lag
      const player = players[name];
      if (isReady(player)) {
        try {
          player.play();
          player.pause();
          player.seekTo(0);
        } catch {}
      }
    });

    log("All sounds loaded + warmed");
  },

  play(name: SoundName, category: SoundCategory = "ui") {
    if (isMuted) {
      log("Muted → blocked:", name);
      return;
    }

    createIfMissing(name);

    const now = Date.now();

    // Cooldown anti-spam
    if (lastPlayed[name] && now - lastPlayed[name]! < SOUND_COOLDOWN) {
      log("Cooldown blocked:", name);
      return;
    }

    lastPlayed[name] = now;

    const player = players[name];
    if (!isReady(player)) return;

    if (LOOPED_SOUNDS.includes(name) && player.loop) {
      log("Loop already running:", name);
      return;
    }

    try {
      // Stop other loops if needed
      if (!LOOPED_SOUNDS.includes(name)) {
        stopAllLoops();
      }

      hardStop(player);

      player.loop = LOOPED_SOUNDS.includes(name);
      player.volume = CATEGORY_VOLUME[category];

      player.play();

      log("Playing:", name);
    } catch (e) {
      log("Play error:", name, e);
    }
  },

  stop(name: SoundName) {
    hardStop(players[name]);
    log("Stopped:", name);
  },

  stopAll() {
    Object.values(players).forEach(hardStop);
    log("Stopped ALL");
  },

  setMuted(value: boolean) {
    isMuted = value;
    if (value) this.stopAll();
    log("Mute set:", value);
  },

  unloadAll() {
    Object.keys(players).forEach((key) => {
      const name = key as SoundName;
      const player = players[name];
      if (isReady(player)) {
        try {
          hardStop(player);
          player.release();
        } catch {}
      }
      delete players[name];
    });

    appStateSubscription?.remove?.();
    appStateSubscription = null;

    log("All players released");
  },

  enableBackgroundProtection() {
    if (appStateSubscription) return; // prevent duplicate listeners

    appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        this.stopAll();
        log("App backgrounded → stopped all sounds");
      }
    });
  },
};
