import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import * as QuizNarrationService from "@/service/QuizNarrationService";

interface UseSummaryNarrationParams {
  correctAnswers?: number;
  totalQuestions?: number;
  isHindi?: boolean;
  isSummaryActive?: boolean;
}

/**
 * Hook for narrating quiz summary and review items.
 * Safety Hardened:
 * - Auto-speaks summary ONLY ONCE when summary opens.
 * - Stops on background/unmount.
 * - Does not auto-speak review items.
 * - Respects narrationEnabled toggle.
 */
export const useSummaryNarration = (params?: UseSummaryNarrationParams) => {
  const { correctAnswers, totalQuestions, isHindi, isSummaryActive } = params || {};
  const narrationEnabled = useSelector(
    (state: RootState) => state.sound.quizNarrationEnabled
  );

  const hasSpokenSummary = useRef(false);

  const speakSummary = useCallback(async (isAuto = false) => {
    // Safety check: narration must be enabled and inputs valid
    if (!narrationEnabled || correctAnswers === undefined || totalQuestions === undefined) {
      return;
    }

    // If auto-triggering, ensure it only happens once
    if (isAuto && hasSpokenSummary.current) {
      return;
    }

    try {
      const text = QuizNarrationService.buildMatchSummaryText(
        correctAnswers,
        totalQuestions,
        !!isHindi
      );
      const normalized = QuizNarrationService.normalizeQuizSpeechText(text);
      const lang = QuizNarrationService.detectSpeechLanguage(normalized);

      await QuizNarrationService.speakQuizQuestion(normalized, lang);
      
      if (isAuto) {
        hasSpokenSummary.current = true;
      }
    } catch (e) {
      if (__DEV__) console.warn("[Speech] Summary trigger failed:", e);
    }
  }, [narrationEnabled, correctAnswers, totalQuestions, isHindi]);

  const speakReviewItem = useCallback(async (
    question: string,
    answer: string,
    explanation: string | undefined | null,
    isHindiProp: boolean
  ) => {
    if (!narrationEnabled) return;

    try {
      const text = QuizNarrationService.buildReviewItemSpeechText(
        question,
        answer,
        explanation,
        isHindiProp
      );
      const normalized = QuizNarrationService.normalizeQuizSpeechText(text);
      const lang = QuizNarrationService.detectSpeechLanguage(normalized);

      await QuizNarrationService.speakQuizQuestion(normalized, lang);
    } catch (e) {
      if (__DEV__) console.warn("[Speech] Review item trigger failed:", e);
    }
  }, [narrationEnabled]);

  // EFFECT: Auto-speak summary once when active
  useEffect(() => {
    if (isSummaryActive) {
      if (narrationEnabled && !hasSpokenSummary.current) {
        speakSummary(true);
      } else if (!narrationEnabled) {
        // If summary is active but narration is OFF, mark as handled
        // so toggling it ON later doesn't auto-speak current summary.
        hasSpokenSummary.current = true;
      }
    }
  }, [isSummaryActive, narrationEnabled, speakSummary]);

  // EFFECT: Handle cleanup and AppState
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState !== "active") {
        QuizNarrationService.stopQuizNarration();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Stop if disabled mid-speech or summary closed
    if (!isSummaryActive || !narrationEnabled) {
      QuizNarrationService.stopQuizNarration();
    }

    return () => {
      subscription.remove();
      QuizNarrationService.stopQuizNarration();
    };
  }, [isSummaryActive, narrationEnabled]);

  return {
    speakSummary: () => speakSummary(false),
    speakReviewItem,
    narrationEnabled,
  };
};
