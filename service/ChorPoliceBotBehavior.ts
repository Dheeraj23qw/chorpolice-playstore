import { MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";

/**
 * @module ChorPoliceBotBehavior
 * @description Handles AI decision-making for the "Chor Police" game mode.
 * * Logic Flow:
 * 1. Waits for PUBLIC_REVEAL (where King and Police are shown).
 * 2. If a Bot is assigned 'Police', it calculates which cards are hidden.
 * 3. After a natural delay (animation + thinking), it submits a guess.
 */

interface BotPlayer {
  id: string;
  name: string;
  avatarId: number;
  isBot?: boolean;
}

export const ChorPoliceBotBehavior = {
  _bots: [] as BotPlayer[],
  _listeners: [] as (() => void)[],
  _guessTimers: [] as ReturnType<typeof setTimeout>[],
  _lastRevealKey: null as string | null,

  /**
   * @function init
   * @description Initializes listeners for bot behavior.
   * Should be called by the Host when the Chor Police game starts.
   */
  init: (bots: BotPlayer[]): void => {
    ChorPoliceBotBehavior.reset();
    ChorPoliceBotBehavior._bots = [...bots];

    if (bots.length === 0) return;

    const botIds = new Set(bots.map((b) => b.id));

    const unsub = subscribeToPackets((packet) => {
      const CP = MODES.CHOR_POLICE;

      if (packet.type === CP.PUBLIC_REVEAL) {
        // Unique key per round/police to prevent duplicate triggers
        const revealKey = `round_${packet.round ?? 0}_pol_${packet.policeId ?? "na"}`;
        if (ChorPoliceBotBehavior._lastRevealKey === revealKey) return;
        ChorPoliceBotBehavior._lastRevealKey = revealKey;

        // Clear any stale timers
        ChorPoliceBotBehavior._guessTimers.forEach(clearTimeout);
        ChorPoliceBotBehavior._guessTimers = [];

        const { policeId, kingIndex, policeIndex } = packet;

        // CHECK: Is the assigned Police one of our bots?
        if (botIds.has(policeId)) {
          const botPlayer = bots.find((b) => b.id === policeId);

          // Identify the two indices that are NOT the King or Police (Thief and Advisor)
          const hiddenIndices = [0, 1, 2, 3].filter(
            (i) => i !== kingIndex && i !== policeIndex,
          );

          /**
           * TIMING STRATEGY:
           * 1. ANIMATION_WAIT: Time for the cards to deal and the 'Police' popup to show.
           *    PROD-11 FIX: 12000ms (was 11500ms) to give 500ms safety margin on slow Android.
           * 2. THINKING_TIME: Random delay to simulate a human looking at the screen.
           */
          const ANIMATION_WAIT = 12000;
          const THINKING_TIME = 2000 + Math.floor(Math.random() * 3000);
          const totalDelay = ANIMATION_WAIT + THINKING_TIME;

          const timer = setTimeout(() => {
            // Safety: Ensure bot is still in the session
            if (!ChorPoliceBotBehavior._bots.some((b) => b.id === policeId))
              return;

            // Randomly guess one of the two hidden cards
            const pick =
              hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];

            handleIncomingPacket({
              type: CP.POLICE_GUESS,
              targetIndex: pick,
              playerId: policeId,
            });

            console.log(
              `🤖 [CPBot] ${botPlayer?.name} guessed index ${pick} after ${totalDelay}ms`,
            );
          }, totalDelay);

          ChorPoliceBotBehavior._guessTimers.push(timer);
        }
      }
    });

    ChorPoliceBotBehavior._listeners.push(unsub);
  },

  /**
   * @function reset
   * @description Stops all AI logic and clears memory.
   * CRITICAL: Call this when the game ends or host leaves.
   */
  reset: (): void => {
    ChorPoliceBotBehavior._guessTimers.forEach(clearTimeout);
    ChorPoliceBotBehavior._guessTimers = [];
    ChorPoliceBotBehavior._lastRevealKey = null;

    ChorPoliceBotBehavior._listeners.forEach((unsub) => unsub());
    ChorPoliceBotBehavior._listeners = [];

    ChorPoliceBotBehavior._bots = [];
  },
};
