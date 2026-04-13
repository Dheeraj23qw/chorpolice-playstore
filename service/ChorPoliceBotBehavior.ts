import { MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";

/**
 * --- CHOR POLICE BOT BEHAVIOR ---
 * SRP: Handles ONLY bot AI for the Chor Police game.
 * Separate from BotEngine (which handles lobby spawning).
 *
 * Bot logic:
 * - Listens for CP_ROLE_ASSIGN packets.
 * - If a bot is Police → auto-sends CP_POLICE_GUESS after a realistic delay.
 * - All other roles (King, Advisor, Thief) are passive — no action needed.
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

  /**
   * Initialize bot behavior listeners for a set of bot players.
   * Call this AFTER ChorPoliceEngine.init() and BEFORE the first round.
   */
  init: (bots: BotPlayer[]): void => {
    ChorPoliceBotBehavior.reset();
    ChorPoliceBotBehavior._bots = [...bots];

    if (bots.length === 0) {
      console.log("🤖 [CPBots] No bots to initialize.");
      return;
    }

    console.log(`🤖 [CPBots] Initializing behavior for ${bots.length} bots: [${bots.map(b => b.name).join(", ")}]`);

    const botIds = new Set(bots.map(b => b.id));

    const unsub = subscribeToPackets((packet) => {
      const CP = MODES.CHOR_POLICE;

      // When a bot is assigned the Police role, auto-guess after a delay
      if (packet.type === CP.PUBLIC_REVEAL) {
        const policeId = packet.policeId;

        console.log(`🤖 [CPBots] PUBLIC_REVEAL received — Police ID: ${policeId}`);
        console.log(`🤖 [CPBots]   Is Police a bot? ${botIds.has(policeId) ? "YES ✅" : "NO ❌"}`);

        // Is the police a bot?
        if (botIds.has(policeId)) {
          const botName = bots.find(b => b.id === policeId)?.name || "Bot";

          // Determine which indices are hidden (not King, not Police)
          const kingIdx = packet.kingIndex;
          const policeIdx = packet.policeIndex;
          const hiddenIndices = [0, 1, 2, 3].filter(
            (i) => i !== kingIdx && i !== policeIdx
          );

          console.log(`🤖 [CPBots]   Bot "${botName}" IS the Police!`);
          console.log(`🤖 [CPBots]   King idx: ${kingIdx}, Police idx: ${policeIdx}`);
          console.log(`🤖 [CPBots]   Hidden indices (Thief/Advisor): [${hiddenIndices.join(", ")}]`);

          // IMPORTANT: The dealing animation takes 11.5s (flip + popups).
          // Bot must wait for that to finish, then add a realistic "thinking" delay.
          // ✅ FIX: Increased delay so Thief/Advisor players see their RoleRevealView
          // for a meaningful amount of time (7.5-12.5s) before the bot guesses.
          // Total: 19-24 seconds after PUBLIC_REVEAL
          const ANIMATION_DURATION = 16000; // 11.5s animation + 4.5s buffer for role reveal
          const THINKING_DELAY = 3000 + Math.floor(Math.random() * 5000); // 3-8s
          const delay = ANIMATION_DURATION + THINKING_DELAY;
          console.log(`🤖 [CPBots]   Will guess in ${delay}ms (${ANIMATION_DURATION}ms anim + ${THINKING_DELAY}ms thinking)`);

          const timer = setTimeout(() => {
            // Safety: Are bots still active?
            if (ChorPoliceBotBehavior._bots.length === 0) {
              console.log(`🤖 [CPBots]   ⚠️ Bot was cleared before guess — aborting`);
              return;
            }

            // 50/50 random pick between the 2 hidden cards
            const pick = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];

            console.log(`🤖 [CPBots] ═══════════════════════════════════`);
            console.log(`🤖 [CPBots] BOT "${botName}" GUESSING index ${pick}`);
            console.log(`🤖 [CPBots] ═══════════════════════════════════`);

            handleIncomingPacket({
              type: CP.POLICE_GUESS,
              targetIndex: pick,
              playerId: policeId,
            });
          }, delay);

          ChorPoliceBotBehavior._guessTimers.push(timer);
        } else {
          console.log(`🤖 [CPBots]   Police is a HUMAN player — bots idle (passive roles)`);
        }
      }
    });

    ChorPoliceBotBehavior._listeners.push(unsub);
  },

  /**
   * Full reset — clears listeners, timers, and bot references.
   */
  reset: (): void => {
    console.log("🤖 [CPBots] Resetting bot behavior...");

    // Clear guess timers
    ChorPoliceBotBehavior._guessTimers.forEach(clearTimeout);
    ChorPoliceBotBehavior._guessTimers = [];

    // Unsubscribe packet listeners
    ChorPoliceBotBehavior._listeners.forEach(unsub => unsub());
    ChorPoliceBotBehavior._listeners = [];

    ChorPoliceBotBehavior._bots = [];
  },
};
