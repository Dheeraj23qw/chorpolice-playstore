import { NETWORK, MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";
import { getBotName, preloadBotNames } from "../utils/nameGenerator";

export const BotEngine = {
  activeBots: [] as any[],
  _listeners: [] as (() => void)[],

  // CALL THIS on lobby mount
  prepareEngine: async (botCount: number) => {
    await preloadBotNames(botCount);
  },

  reset: () => {
    BotEngine._listeners.forEach((unsub) => unsub());
    BotEngine._listeners = [];
    BotEngine.activeBots = [];
  },

  spawn: (count: number) => {
    BotEngine.reset();

    for (let i = 0; i < count; i++) {
      // ✅ Now instant, thanks to preloading!
      const botName = getBotName(i);
      const botId = `bot_${botName.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`;

      const botPlayer = {
        id: botId,
        name: botName,
        avatarId: (i % 13) + 1,
        isBot: true,
      };

      BotEngine.activeBots.push(botPlayer);

      setTimeout(
        () => {
          handleIncomingPacket({
            type: NETWORK.PLAYER_JOIN,
            player: botPlayer,
          });
        },
        500 + i * 200,
      );
    }

    BotEngine.initializeListeners();
  },

  initializeListeners: () => {
    const unsub = subscribeToPackets((packet) => {
      if (packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC) {
        BotEngine.activeBots.forEach((bot) => {
          const delay = Math.floor(Math.random() * 9000) + 3000;
          setTimeout(() => {
            if (BotEngine.activeBots.length === 0) return;
            handleIncomingPacket({
              type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
              playerId: bot.id,
              isCorrect: Math.random() > 0.3,
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
