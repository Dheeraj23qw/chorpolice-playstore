import * as Speech from "expo-speech";

/**
 * PRODUCTION-READY QUIZ NARRATION SERVICE
 * Handles question and options text-to-speech with Hinglish support.
 * Safety hardened: Silent failure in prod, dev-only logs.
 */

export interface SpeakQuizParams {
  question: string;
  options: string[];
  isHindi: boolean;
}

/**
 * Detects if the text contains Devanagari characters.
 * If yes, returns "hi-IN", otherwise returns "en-IN".
 */
export const detectSpeechLanguage = (text: string): string => {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return "hi-IN";
  return "en-IN";
};

/**
 * Normalizes common Hinglish words to improve pronunciation in en-IN voice.
 * Focuses on phonetic spelling for Roman Hinglish.
 * Hardened: Uses word-boundary check to prevent accidental corruption.
 */
export const normalizeQuizSpeechText = (text: string): string => {
  if (!text) return "";

  let normalized = text;
  const replacements: Record<string, string> = {
    Chor: "Chor",
    Sipahi: "Si-paa-hee",
    Mantri: "Mun-tree",
    Raja: "Raa-jaa",
    kitne: "kit-nay",
  };

  Object.entries(replacements).forEach(([word, replacement]) => {
    // \b ensures we only replace whole words, not fragments inside other words
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    normalized = normalized.replace(regex, replacement);
  });

  return normalized;
};

/**
 * Builds a formatted narration string: "Question. {Q}. Option A. {A}..."
 */
export const buildQuizSpeechText = (
  question: string,
  options: string[],
): string => {
  const letters = ["A", "B", "C", "D"];
  const optionsText = options
    .map((opt, i) => `Option ${letters[i]}. ${opt}.`)
    .join(" ");

  return `Question. ${question}. ${optionsText}`;
};

/**
 * Builds text for the match summary overview.
 */
export const buildMatchSummaryText = (
  correctAnswers: number,
  totalQuestions: number,
  isHindi: boolean,
): string => {
  if (isHindi) {
    return `Match Summary. Aapne ${totalQuestions} me se ${correctAnswers} answers sahi diye hain. Bahut achha!`;
  }
  return `Match Summary. You answered ${correctAnswers} out of ${totalQuestions} questions correctly. Well done!`;
};

/**
 * Builds text for an individual review item.
 */
export const buildReviewItemSpeechText = (
  question: string,
  answer: string,
  explanation: string | undefined | null,
  isHindi: boolean,
): string => {
  const q = question || "";
  const a = answer || "";
  const h = explanation && explanation.trim() ? explanation : "";

  if (isHindi) {
    let text = `Question. ${q}. Sahi answer hai ${a}.`;
    if (h) text += ` Explanation. ${h}`;
    return text;
  }
  let text = `Question. ${q}. The correct answer is ${a}.`;
  if (h) text += ` Explanation. ${h}`;
  return text;
};

/**
 * Stops any current speech immediately.
 */
export const stopQuizNarration = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    if (__DEV__) console.warn("[Speech] Stop failed:", error);
  }
};

/**
 * Speaks a short welcome message to warm up the TTS engine on app startup.
 * Uses the same expo-speech configuration as quiz narration.
 * Does not interfere with quiz narration because quiz always calls Speech.stop() first.
 */
export const warmupSpeech = () => {
  try {
    Speech.stop();
    const voice = getBestQuizVoiceSync("hi-IN");
    Speech.speak("Welcome to Chor Police! Get ready to catch the Chor!", {
      language: "en-IN",
      voice,
      rate: 0.85,
      pitch: 1.0,
      volume: 1.0,
      onDone: () => {
        if (__DEV__) console.log("[Speech] Warmup complete");
      },
      onError: (error) => {
        if (__DEV__) console.warn("[Speech] Warmup error:", error);
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("[Speech] Warmup failed:", error);
    }
  }
};

let cachedVoices: Speech.Voice[] | null = null;

/**
 * Preloads available voices in the background for zero-lag speech triggers.
 */
export const preloadVoices = () => {
  if (!cachedVoices) {
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        cachedVoices = voices;
      })
      .catch(() => {});
  }
};

// Immediately trigger background preload on module load
preloadVoices();

/**
 * Synchronous voice resolution from cached voices.
 */
export const getBestQuizVoiceSync = (language: string): string | undefined => {
  if (!cachedVoices || cachedVoices.length === 0) return undefined;

  const langLower = language.toLowerCase();
  const matchingVoices = cachedVoices.filter((v) => {
    const vLang = v.language.toLowerCase();
    const vName = (v.name + v.identifier).toLowerCase();
    const isCorrectLang =
      vLang.startsWith(langLower) ||
      (langLower === "en-in" && vLang.startsWith("en")) ||
      (langLower === "hi-in" && vLang.startsWith("hi"));

    const isFemale =
      vName.includes("female") ||
      vName.includes("woman") ||
      vName.includes("lady") ||
      vName.includes("girl");

    return isCorrectLang && !isFemale;
  });

  if (matchingVoices.length === 0) return undefined;

  if (langLower.startsWith("hi")) {
    const hieNetwork = matchingVoices.find(
      (v) => v.identifier === "hi-in-x-hie-network",
    );
    if (hieNetwork) return hieNetwork.identifier;
  }

  return matchingVoices[0].identifier;
};

/**
 * Loads available voices and finds the best match for the given language.
 * Prefers en-IN for English/Hinglish and hi-IN for Hindi.
 * Prefers bold male voices if available.
 * Prefers 'enhanced' or high-quality voices.
 */
export const getBestQuizVoice = async (
  language: string,
): Promise<string | undefined> => {
  const syncVoice = getBestQuizVoiceSync(language);
  if (syncVoice) return syncVoice;

  try {
    if (!cachedVoices) {
      cachedVoices = await Speech.getAvailableVoicesAsync();
    }

    return getBestQuizVoiceSync(language);
  } catch (error) {
    console.error("[Speech] Failed to get best voice:", error);
    return undefined;
  }
};

export interface SpeakOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onDone?: () => void;
}

/**
 * Speaks the provided text using expo-speech.
 * Uses provided tuning parameters or defaults.
 */
export const speakQuizQuestion = async (
  text: string,
  language: string,
  options: SpeakOptions = {},
) => {
  try {
    // Instant interrupt for maximum responsiveness
    Speech.stop();

    if (!text || !text.trim()) return;

    const {
      voice,
      rate = 1.02,
      pitch = 1.0,
      volume = 1.0,
      onStart,
      onDone,
    } = options;

    Speech.speak(text, {
      language,
      voice,
      rate,
      pitch,
      volume,
      onStart,
      onDone,
      onError: (error) => {
        if (__DEV__) {
          console.warn("[Speech] Speak callback error:", error);
        }
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("[Speech] Execution failed:", error);
    }
  }
};
