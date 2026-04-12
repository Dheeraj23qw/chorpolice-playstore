import { NETWORK, MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";
import { generateRandomName } from "../utils/generateRandomnames";

/**
 * --- BOT ENGINE ---
 * WHY: Spawns virtual clients on the host device to fill lobbies.
 * These bots follow the same protocol as human clients.
 */
export const BotEngine = {
  activeBots: [] as any[],
  _listeners: [] as (() => void)[],

  /**
   * Resets the bot engine state (clears active bots and kills listeners).
   * WHY: Prevents memory leaks and duplicate bot responses.
   */
  reset: () => {
    console.log("🤖 [BotEngine] Performing full state reset...");
    
    // Stop all active network listeners
    BotEngine._listeners.forEach(unsub => unsub());
    BotEngine._listeners = [];
    
    // Clear bots
    BotEngine.activeBots = [];
  },

  /**
   * Spawns multiple bot players and injects them into the room.
   */
  spawn: (count: number) => {
    BotEngine.reset();
    console.log(`🤖 [BotEngine] Spawning ${count} bots for high-pressure simulation...`);
    
    const BOT_NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
    
    // Create a pool of available kid avatars (1-13)
    const availableAvatars = Array.from({ length: 13 }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5); // Shuffle for uniqueness
    
    for (let i = 0; i < count; i++) {
      const botName = BOT_NAMES[i] || `Bot ${i + 1}`;
      const botId = `bot_${botName.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`;
      
      const avatarId = availableAvatars[i] || (i % 13) + 1;

      const botPlayer = {
        id: botId,
        name: botName,
        avatarId: avatarId,
        isBot: true,
      };

      BotEngine.activeBots.push(botPlayer);

      // 📡 Delay joining to ensure Lobby listeners are attached
      setTimeout(() => {
        handleIncomingPacket({
          type: NETWORK.PLAYER_JOIN,
          player: botPlayer,
        });
      }, 500 + (i * 200)); // Stagger them for better UX
    }

    BotEngine.initializeListeners();
  },

  /**
   * Listens for game events and simulates bot behavior.
   * FIX: Centralized listener to avoid memory leaks/duplicate answers.
   */
  initializeListeners: () => {
    console.log("🤖 [BotEngine] Initializing centralized listeners for virtual clients.");
    
    const unsub = subscribeToPackets((packet) => {
      // 🎮 GAME START
      if (packet.type === MODES.THINK_AND_COUNT.GAME_START) {
        console.log("🤖 [BotEngine] Bots ready for multiplayer session.");
      }

      // 📡 NEW QUESTION (Round Sync)
      if (packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC) {
        console.log(`🤖 [BotEngine] Handling round ${packet.round} for virtual clients...`);
        
        BotEngine.activeBots.forEach((bot) => {
          // 🏎️ Random Thinking Delay (3s to 12s)
          const delay = Math.floor(Math.random() * 9000) + 3000;
          
          setTimeout(() => {
            // Safety: Did the game end or bots cleared?
            if (BotEngine.activeBots.length === 0) return;

            const isCorrect = Math.random() > 0.3; // 70% Accuracy
            console.log(`🤖 [BotEngine] Bot '${bot.name}' result for Round ${packet.round}: ${isCorrect ? '✅' : '❌'}`);
            
            handleIncomingPacket({
              type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
              playerId: bot.id,
              isCorrect: isCorrect, 
              timeTaken: delay,
              timestamp: Date.now(),
            });
          }, delay);
        });
      }
    });

    BotEngine._listeners.push(unsub);
  },
};
