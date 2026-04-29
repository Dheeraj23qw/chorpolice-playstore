import { Asset } from "expo-asset";

const INTRO_ASSETS = [
  require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
  require("@/assets/images/bg/image.webp"),
  require("@/assets/modalImages/intro.webp"),
  require("@/assets/images/chorsipahi/thief.webp"),
  require("@/assets/images/chorsipahi/police.webp"),
  require("@/assets/images/chorsipahi/king.webp"),
];

const BACKGROUND_ASSETS = [
  ...INTRO_ASSETS,
  require("@/assets/audio/chorPolice/level.mp3"),
  require("@/assets/audio/chorPolice/lose.mp3"),
  require("@/assets/audio/chorPolice/quiz.mp3"),
  require("@/assets/audio/chorPolice/round.mp3"),
  require("@/assets/audio/chorPolice/select.mp3"),
  require("@/assets/audio/chorPolice/spin.mp3"),
  require("@/assets/audio/chorPolice/won.mp3"),
  require("@/assets/audio/maingame/king.mp3"),
  require("@/assets/audio/maingame/police.mp3"),
  require("@/assets/audio/QuizScreen/timer.mp3"),
  require("@/assets/audio/QuizScreen/timesup.mp3"),
  require("@/assets/images/bg/gamemode/2.webp"),
  require("@/assets/modalImages/chor_win.webp"),
  require("@/assets/modalImages/police_win.webp"),
];

let introPreloadPromise: Promise<void> | null = null;
let backgroundPreloadPromise: Promise<void> | null = null;

const preloadIntroAssets = async () => {
  if (!introPreloadPromise) {
    introPreloadPromise = Asset.loadAsync(INTRO_ASSETS)
      .then(() => undefined)
      .catch((error) => {
        console.warn("Intro asset preload failed", error);
      });
  }

  return introPreloadPromise;
};

export const assetLoader = {
  preloadIntroAssets,
  preloadBackgroundAssets() {
    if (!backgroundPreloadPromise) {
      backgroundPreloadPromise = Asset.loadAsync(BACKGROUND_ASSETS)
        .then(() => undefined)
        .catch((error) => {
          console.warn("Background asset preload failed", error);
        });
    }

    return backgroundPreloadPromise;
  },
};
