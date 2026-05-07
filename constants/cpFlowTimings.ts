/**
 * Central timing config for the Chor Police multiplayer round flow.
 *
 * Change timing here — it propagates everywhere automatically.
 *
 * Full round sequence:
 *   SHUFFLE_DURATION_MS         → card dealing animation
 *   PUBLIC_REVEAL_DURATION_MS   → King + Police publicly revealed
 *   HUMAN_ROLE_REVEAL_DURATION_MS → player sees their own private role
 *   MYSTERY_SHUFFLE_DURATION_MS → 3 mystery investigation cards shuffle
 *
 * Police clicking is only unlocked after all 4 phases above complete.
 */
export const CP_FLOW_TIMINGS = {
  /** Duration of the card dealing/spinning animation (ms). */
  SHUFFLE_DURATION_MS: 5000,

  /** How long King + Police cards are held in the center before role reveal (ms). */
  PUBLIC_REVEAL_DURATION_MS: 2000,

  /** Duration the human player sees their own private role screen (ms). */
  HUMAN_ROLE_REVEAL_DURATION_MS: 3000,

  /** Duration of the 3-card mystery shuffle animation before Police can click (ms). */
  MYSTERY_SHUFFLE_DURATION_MS: 4000,

  /** Duration of a single card flip animation (ms). */
  CARD_FLIP_DURATION_MS: 600,

  /** When non-King/Police cards start fading OUT during the dealing animation. */
  NON_REVEAL_FADE_OFFSET_MS: 3000,

  // --- Police Investigation Reveal Flow ---

  /** Duration of the initial flip for the card selected by the Police (ms). */
  POLICE_SELECTED_CARD_FLIP_MS: 600,

  /** Delay after the first card flips before the remaining 2 mystery cards start flipping (ms). */
  POLICE_REMAINING_CARDS_DELAY_MS: 700,

  /** Duration of the flip animation for the remaining 2 cards (ms). */
  POLICE_REMAINING_CARDS_FLIP_MS: 700,

  /** Duration of the cinematic result overlay ("Police Win", etc) (ms). */
  CINEMATIC_RESULT_REVEAL_MS: 1500,
} as const;

/** Total time before Police clicking is enabled (ms). */
export const CP_POLICE_TURN_DELAY_MS =
  CP_FLOW_TIMINGS.SHUFFLE_DURATION_MS +
  CP_FLOW_TIMINGS.PUBLIC_REVEAL_DURATION_MS +
  CP_FLOW_TIMINGS.HUMAN_ROLE_REVEAL_DURATION_MS +
  CP_FLOW_TIMINGS.MYSTERY_SHUFFLE_DURATION_MS;
