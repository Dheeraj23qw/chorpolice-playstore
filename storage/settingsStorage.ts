import { storage } from "@/storage/mmkv";

const QUIZ_NARRATION_ENABLED_KEY = "settings_quiz_narration_enabled";

/**
 * Saves the quiz narration preference to MMKV.
 */
export const saveQuizNarrationEnabled = (enabled: boolean) => {
  try {
    storage.set(QUIZ_NARRATION_ENABLED_KEY, enabled);
  } catch (e) {
    console.error("Narration setting save failed", e);
  }
};

/**
 * Loads the quiz narration preference from MMKV.
 * Defaults to true for better accessibility/UX.
 */
export const loadQuizNarrationEnabled = (): boolean => {
  try {
    const value = storage.getBoolean(QUIZ_NARRATION_ENABLED_KEY);
    // If undefined (first run), default to true
    return value === undefined ? true : value;
  } catch {
    return true;
  }
};
