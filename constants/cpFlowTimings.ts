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
  SHUFFLE_DURATION_MS: 4000,

  /** How long King + Police cards are held in the center before role reveal (ms). */
  PUBLIC_REVEAL_DURATION_MS: 2000,

  /** Duration the human player sees their own private role screen (ms). */
  HUMAN_ROLE_REVEAL_DURATION_MS: 3000,

  /** Duration of the 3-card mystery shuffle animation before Police can click (ms). */
  MYSTERY_SHUFFLE_DURATION_MS: 4000,

  /** Duration of a single card flip animation (ms). */
  CARD_FLIP_DURATION_MS: 600,

  /**
   * When non-King/Police cards start fading OUT during the dealing animation.
   * Must be strictly less than SHUFFLE_DURATION_MS.
   * Cards fade for (SHUFFLE_DURATION_MS - NON_REVEAL_FADE_OFFSET_MS) ms before reveal.
   */
  NON_REVEAL_FADE_OFFSET_MS: 3000,
} as const;

/** Total time before Police clicking is enabled (ms). */
export const CP_POLICE_TURN_DELAY_MS =
  CP_FLOW_TIMINGS.SHUFFLE_DURATION_MS +
  CP_FLOW_TIMINGS.PUBLIC_REVEAL_DURATION_MS +
  CP_FLOW_TIMINGS.HUMAN_ROLE_REVEAL_DURATION_MS +
  CP_FLOW_TIMINGS.MYSTERY_SHUFFLE_DURATION_MS;
