export const CP_FLOW_TIMINGS = {
  /** Duration of the card dealing/spinning animation (ms). */
  SHUFFLE_DURATION_MS: 7000,

  /** How long King + Police cards are held in the center before role reveal (ms). */
  PUBLIC_REVEAL_DURATION_MS: 3000,

  /** Duration the human player sees their own private role screen (ms). */
  HUMAN_ROLE_REVEAL_DURATION_MS: 3000,

  /** Duration of the 3-card mystery shuffle animation before Police can click (ms). */
  MYSTERY_SHUFFLE_DURATION_MS: 4000,

  /** Duration of a single card flip animation (ms). */
  CARD_FLIP_DURATION_MS: 600,

  /** When non-King/Police cards start fading OUT during the dealing animation. */
  NON_REVEAL_FADE_OFFSET_MS: 7000,

  // --- Police Investigation Reveal Flow ---

  /** Duration of the initial flip for the card selected by the Police (ms). */
  POLICE_SELECTED_CARD_FLIP_MS: 600,

  /** Delay after the first card flips before the remaining 2 mystery cards start flipping (ms). */
  POLICE_REMAINING_CARDS_DELAY_MS: 700,

  /** Duration of the flip animation for the remaining 2 cards (ms). */
  POLICE_REMAINING_CARDS_FLIP_MS: 700,

  // --- Police Reveal Smash-Out Sequence ---

  /** Duration of the smash-out: the 2 unselected mystery cards fly off the
   *  board in random directions while the selected card rises up (ms). */
  MYSTERY_SMASH_OUT_MS: 900,

  /** Full board freeze after the Police taps a card: the 2 unselected cards
   *  smash out during this window, while the selected card stays put (ms). */
  MYSTERY_FREEZE_MS: 1200,

  /** How long the selected card takes to travel to the center of the board (ms). */
  MYSTERY_RISE_MS: 800,

  /** Pause the selected card at the center of the board before it flips (ms). */
  MYSTERY_CENTER_HOLD_MS: 2000,

  /** Duration of the cinematic result overlay ("Police Win", etc) (ms). */
  CINEMATIC_RESULT_REVEAL_MS: 3000,
} as const;
