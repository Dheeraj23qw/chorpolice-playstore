import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";

import { RootState } from "@/redux/store";
import * as QuizNarrationService from "@/service/QuizNarrationService";

interface UseQuizNarrationParams {
  question: string | undefined;
  options: string[];
  isHindi: boolean;
  isQuizActive: boolean;
  isRevealPhase: boolean;
  narrationEnabled: boolean;
  questionId: string | null;
}

/**
 * Hook to manage quiz narration lifecycle.
 */
export const useQuizNarration = ({
  question,
  options,
  isHindi,
  isQuizActive,
  isRevealPhase,
  narrationEnabled,
  questionId,
}: UseQuizNarrationParams) => {
  const lastSpokenId = useRef<string | null>(null);
  const narrationEnabledRef = useRef(narrationEnabled);

  const {
    quizNarrationVoiceId,
    quizNarrationRate,
    quizNarrationPitch,
  } = useSelector((state: RootState) => state.sound);

  // Sync ref with prop
  useEffect(() => {
    narrationEnabledRef.current = narrationEnabled;
  }, [narrationEnabled]);

  // Memoized speech trigger
  const startNarration = useCallback((isAutoTrigger = true) => {
    // 1. Safety Checks
    if (!narrationEnabled || !question || !isQuizActive || isRevealPhase) {
      return;
    }

    // 2. Build and Speak (Synchronous trigger for zero latency)
    try {
      const speechText = QuizNarrationService.buildQuizSpeechText(question, options);
      const normalizedText = QuizNarrationService.normalizeQuizSpeechText(speechText);

      const voiceId = quizNarrationVoiceId || QuizNarrationService.getBestQuizVoiceSync("hi-IN");

      QuizNarrationService.speakQuizQuestion(normalizedText, "hi-IN", {
        voice: voiceId,
        rate: quizNarrationRate,
        pitch: quizNarrationPitch,
      });

    } catch (e) {
      if (__DEV__) console.warn("[Speech] Hook trigger failed:", e);
    }
  }, [
    narrationEnabled,
    question,
    options,
    isQuizActive,
    isRevealPhase,
    quizNarrationVoiceId,
    quizNarrationRate,
    quizNarrationPitch,
  ]);


  // EFFECT: Automatic narration trigger on question change
  useEffect(() => {
    if (questionId && questionId !== lastSpokenId.current) {
      lastSpokenId.current = questionId;
      
      // Only auto-speak if narration is already enabled when question changes
      if (narrationEnabled) {
        startNarration(true);
      }
    }
  }, [questionId, narrationEnabled, startNarration]);

  // EFFECT: Handle toggle OFF while speaking & AppState
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState !== "active") {
        QuizNarrationService.stopQuizNarration();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    if (!isQuizActive || isRevealPhase || !narrationEnabled) {
      QuizNarrationService.stopQuizNarration();
    }

    return () => {
      subscription.remove();
    };
  }, [isQuizActive, isRevealPhase, narrationEnabled]);

  // Lifecycle cleanup
  useEffect(() => {
    return () => {
      QuizNarrationService.stopQuizNarration();
    };
  }, []);

  return {
    repeatNarration: () => startNarration(false),
    stopNarration: QuizNarrationService.stopQuizNarration,
  };
};
