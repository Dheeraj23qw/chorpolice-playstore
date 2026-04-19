/**
 * @file useCPQuizSystem.ts
 * @description Decouples the Score Quiz logic from the main game loop.
 */
import { useState, useCallback, useRef } from "react";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { AudioEngine } from "@/audio/audioEngine";

export const useCPQuiz = (timer: any, gameState: any) => {
  const [quizPlayerIndex, setQuizPlayerIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizOptionDisabled, setQuizOptionDisabled] = useState(false);
  const quizOptionDisabledRef = useRef(false);
  const [quizDone, setQuizDone] = useState(false);

  const processQuizAnswer = useCallback(
    (selectedScore: number, playerIdx: number) => {
      const players = ChorPoliceEngine.state.players;
      const scores = ChorPoliceEngine.state.scores;
      const player = players[playerIdx];
      if (!player) return;

      const correctScore = scores[player.id]?.totalScore ?? 0;
      const isCorrect = selectedScore === correctScore;
      const bonus = isCorrect ? 2000 : -2000;

      // Apply bonus to engine
      if (scores[player.id]) scores[player.id].totalScore += bonus;

      // Update UI via the gameState module we built earlier
      gameState.setPlayerScores((prev: any) =>
        prev.map((p: any) =>
          p.playerName === player.name
            ? { ...p, scores: [...p.scores, bonus] }
            : p,
        ),
      );

      AudioEngine.play(isCorrect ? "win" : "lose", "gameplay");

      // Trigger the dynamic popup through the UI state
      gameState.setUi((prev: any) => ({
        ...prev,
        isDynamicPopUp: true,
        mediaId: isCorrect ? 2 : 1,
        playerData: {
          name: player.name,
          message: isCorrect
            ? `guessed correctly! +2000 🎉`
            : `guessed wrong! -2000 😢`,
        },
      }));

      timer.add(
        () => gameState.setUi((p: any) => ({ ...p, isDynamicPopUp: false })),
        3500,
      );
      timer.add(() => setQuizPlayerIndex((prev) => prev + 1), 4000);
    },
    [timer, gameState],
  );

  const prepareQuiz = useCallback(() => {
    setQuizPlayerIndex(0);
    setQuizDone(false);
    setQuizOptionDisabled(false);
    quizOptionDisabledRef.current = false;
  }, []);

  return {
    quizPlayerIndex,
    quizOptions,
    quizOptionDisabled,
    quizDone,
    setQuizOptions,
    setQuizOptionDisabled,
    quizOptionDisabledRef,
    processQuizAnswer,
    prepareQuiz,
    setQuizDone,
  };
};
