import { storage } from "@/storage/mmkv";

const QUIZ_NARRATION_ENABLED_KEY = "settings_quiz_narration_enabled";
const QUIZ_NARRATION_VOICE_ID_KEY = "settings_quiz_narration_voice_id";
const QUIZ_NARRATION_RATE_KEY = "settings_quiz_narration_rate";
const QUIZ_NARRATION_PITCH_KEY = "settings_quiz_narration_pitch";

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

export const saveQuizNarrationVoiceId = (voiceId: string | undefined) => {
  storage.set(QUIZ_NARRATION_VOICE_ID_KEY, voiceId || "");
};

export const loadQuizNarrationVoiceId = (): string | undefined => {
  const value = storage.getString(QUIZ_NARRATION_VOICE_ID_KEY);
  if (value === "") return undefined;
  // Default to the high-quality network voice if nothing is set
  return value === undefined ? "hi-in-x-hie-network" : value;
};


export const saveQuizNarrationRate = (rate: number) => {
  storage.set(QUIZ_NARRATION_RATE_KEY, rate);
};

export const loadQuizNarrationRate = (): number => {
  const val = storage.getNumber(QUIZ_NARRATION_RATE_KEY);
  return val === undefined ? 0.80 : val;
};

export const saveQuizNarrationPitch = (pitch: number) => {
  storage.set(QUIZ_NARRATION_PITCH_KEY, pitch);
};

export const loadQuizNarrationPitch = (): number => {
  const val = storage.getNumber(QUIZ_NARRATION_PITCH_KEY);
  return val === undefined ? 0.80 : val;
};



