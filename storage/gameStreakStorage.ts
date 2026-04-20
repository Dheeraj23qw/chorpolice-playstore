import { GameStreakState, initialGameStreakState } from "@/features/gameStreakSlice";
import { storage } from "@/storage/mmkv";

const STORAGE_KEY = "GameStreakState";

export const loadGameStreak = (): GameStreakState | undefined => {
  try {
    const json = storage.getString(STORAGE_KEY);
    if (!json) return undefined;

    const parsed = JSON.parse(json);
    return {
      currentStreak:
        typeof parsed.currentStreak === "number"
          ? parsed.currentStreak
          : initialGameStreakState.currentStreak,
      highestStreak:
        typeof parsed.highestStreak === "number"
          ? parsed.highestStreak
          : initialGameStreakState.highestStreak,
      lastActiveDate:
        typeof parsed.lastActiveDate === "string" ||
        parsed.lastActiveDate === null
          ? parsed.lastActiveDate
          : initialGameStreakState.lastActiveDate,
    };
  } catch (e) {
    console.error("[GameStreak] Load failed", e);
    return undefined;
  }
};

export const saveGameStreak = (state: GameStreakState) => {
  try {
    storage.set(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("[GameStreak] Save failed", e);
  }
};
