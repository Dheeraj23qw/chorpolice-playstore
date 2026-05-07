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
 * Speaks the provided text using expo-speech.
 * Uses rate 0.88 for better clarity in quiz context.
 */
export const speakQuizQuestion = async (
  text: string,
  language: string,
  onStart?: () => void,
  onDone?: () => void,
) => {
  try {
    await stopQuizNarration();

    if (!text || !text.trim()) return;

    Speech.speak(text, {
      language,
      rate: 0.88,
      pitch: 1.0,
      volume: 1.0,
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
