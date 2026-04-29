/**
 * --- QUIZ GAME CONSTANTS ---
 * Single source of truth shared across QuizScreen and GameLogic.
 * WHY: Prevents the ReferenceError crash where NUM_QUESTIONS was only
 *      defined inside the hook but consumed in the UI component.
 */

/** Total number of rounds per game session. Must match QuizEngine.state.totalRounds. */
export const NUM_QUESTIONS = 5;

/** Delay (ms) before transitioning away from the answer feedback popup. */
export const POPUP_DELAY = 3000;

/** Timer values (seconds) by difficulty — used both for countdown and timeTaken calc. */
export const TIMER_BY_DIFFICULTY = {
  easy: 30,
  medium: 60,
  hard: 100,
} as const;
