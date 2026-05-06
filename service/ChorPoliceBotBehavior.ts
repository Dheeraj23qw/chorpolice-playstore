import { MODES } from "../constants/Networking";
import { dispatchPacket, subscribeToDispatch } from "@/service/packetDispatcher";

type GetGameState = () => any | null;
let getGameState: GetGameState | null = null;

export const registerBotStateGetter = (getter: GetGameState) => {
  getGameState = getter;
};

/**
 * @module ChorPoliceBotBehavior
 * @description Handles AI decision-making for the "Chor Police" game mode.
 * Logic Flow:
 * 1. Waits for CP_POLICE_TURN_READY (dispatched after investigation shuffle ends).
 * 2. If a Bot is assigned 'Police', it picks from investigation targets.
 * 3. After a natural thinking delay (1.2–2.4s), it submits a guess.
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

    // 🛡️ Subscribe to packets via the neutral dispatcher bridge (Decoupled)
    const unsub = subscribeToDispatch((packet) => {
      if (packet.type === MODES.CHOR_POLICE.POLICE_TURN_READY) {
        ChorPoliceBotBehavior.triggerBotLogic(packet);
      } else if (packet.type === "NETWORK_BOT_REPLACED") {
        ChorPoliceBotBehavior.addBot(packet.player);
      }
    });

    ChorPoliceBotBehavior._listeners.push(unsub);
  },

  /**
   * @function addBot
   * @description Adds a bot mid-game (e.g. after human disconnects).
   */
  addBot: (bot: BotPlayer): void => {
    if (ChorPoliceBotBehavior._bots.some(b => b.id === bot.id)) return;
    
    console.log(`🤖 [CPBot] Mid-game activation for bot: ${bot.name}`);
    ChorPoliceBotBehavior._bots.push(bot);

    // If a round is already active (public reveal happened), trigger logic immediately
    // Note: In a real game, we'd need the current reveal data to trigger a guess.
  },

  triggerBotLogic: (packet: any, retryCount = 0): void => {
    const CP = MODES.CHOR_POLICE;
    const bots = ChorPoliceBotBehavior._bots;
    const botIds = new Set(bots.map((b) => b.id));

    // Max retries (20 * 500ms = 10s) to avoid infinite loops if something hangs
    if (retryCount > 20) {
      console.warn("🤖 [CPBot] Max retries reached. Aborting bot guess.");
      return;
    }

    // Unique key per round/police to prevent duplicate triggers
    const revealKey = `round_${packet.round ?? 0}_pol_${packet.policeId ?? "na"}`;
    if (ChorPoliceBotBehavior._lastRevealKey === revealKey && retryCount === 0) return;
    ChorPoliceBotBehavior._lastRevealKey = revealKey;

    // Clear any stale timers
    ChorPoliceBotBehavior._guessTimers.forEach(clearTimeout);
    ChorPoliceBotBehavior._guessTimers = [];

    const { policeId, kingIndex, policeIndex } = packet;

    // CHECK: Is the assigned Police one of our bots?
    if (botIds.has(policeId)) {
      console.log("🤖 [CPBot] police turn ready");

      const botPlayer = bots.find((b) => b.id === policeId);

      // 🎯 TARGETING STRATEGY:
      const investigationTargets = packet.investigationTargets as any[];
      
      /**
       * BOT DELAY STRATEGY:
       * Since we are now triggered precisely at the start of the police turn,
       * we only need a natural thinking delay.
       */
      const totalDelay = 1200 + Math.floor(Math.random() * 1200);

      let guessPayload: any = { playerId: policeId };

      if (investigationTargets && investigationTargets.length > 0) {
        const pick = investigationTargets[Math.floor(Math.random() * investigationTargets.length)];
        guessPayload.targetId = pick.id;
        guessPayload.targetIndex = pick.playerIndex; // null for Joker
        console.log(`🤖 [CPBot] picked target: ${pick.id} (Role: ${pick.role})`);
      } else {
        const hiddenIndices = [0, 1, 2, 3].filter(i => i !== kingIndex && i !== policeIndex);
        const pickIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        guessPayload.targetIndex = pickIndex;
        console.log(`🤖 [CPBot] picked legacy index: ${pickIndex}`);
      }

      const timer = setTimeout(() => {
        // Safety: Ensure bot is still in the session
        if (!ChorPoliceBotBehavior._bots.some((b) => b.id === policeId)) return;

        // 🛡️ Dispatch guess via the neutral bridge
        dispatchPacket({
          type: CP.POLICE_GUESS,
          ...guessPayload
        });

        console.log(
          `🤖 [CPBot] ${botPlayer?.name} submitted guess after ${totalDelay}ms`,
        );
      }, totalDelay);

      ChorPoliceBotBehavior._guessTimers.push(timer);
    }
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
