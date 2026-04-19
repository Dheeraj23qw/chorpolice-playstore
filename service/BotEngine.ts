import { NETWORK, MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";
import { getBotName, preloadBotNames } from "../utils/nameGenerator";

export const BotEngine = {
  activeBots: [] as any[],
  _listeners: [] as (() => void)[],
  _joinTimers: [] as ReturnType<typeof setTimeout>[],
  _answerTimers: [] as ReturnType<typeof setTimeout>[],
  _lastQuestionId: null as string | null,

  // CALL THIS on lobby mount
  prepareEngine: async (botCount: number) => {
    await preloadBotNames(botCount);
  },

  reset: () => {
    BotEngine._listeners.forEach((unsub) => unsub());
    BotEngine._listeners = [];
    BotEngine._joinTimers.forEach(clearTimeout);
    BotEngine._joinTimers = [];
    BotEngine._answerTimers.forEach(clearTimeout);
    BotEngine._answerTimers = [];
    BotEngine.activeBots = [];
    BotEngine._lastQuestionId = null;
  },

  spawn: (count: number) => {
    BotEngine.reset();

    let usedAvatars = new Set<number>();

    const getAvatar = () => {
      if (usedAvatars.size >= 13) {
        usedAvatars.clear(); // ✅ prevent infinite loop
      }

      let id;
      do {
        id = Math.floor(Math.random() * 13) + 1;
      } while (usedAvatars.has(id));

      usedAvatars.add(id);
      return id;
    };

    for (let i = 0; i < count; i++) {
      const botName = getBotName(i);
      const botId = `bot_${botName.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`;

      const botPlayer = {
        id: botId,
        name: botName,
        avatarId: getAvatar(),
        isBot: true,
      };

      BotEngine.activeBots.push(botPlayer);

      const joinTimer = setTimeout(
        () => {
          handleIncomingPacket({
            type: NETWORK.PLAYER_JOIN,
            player: botPlayer,
          });
        },
        500 + i * 200,
      );
      BotEngine._joinTimers.push(joinTimer);
    }

    BotEngine.initializeListeners();
  },
  initializeListeners: () => {
    const unsub = subscribeToPackets((packet) => {
      if (packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC) {
        const questionId = packet.questionId || `round-${packet.round || 0}`;
        if (BotEngine._lastQuestionId === questionId) {
          return;
        }

        BotEngine._lastQuestionId = questionId;
        BotEngine._answerTimers.forEach(clearTimeout);
        BotEngine._answerTimers = [];

        const durationMs = Math.max(1500, packet.durationMs || 10000);
        const safeAnswerWindowMs = Math.max(1200, durationMs - 1200);

        BotEngine.activeBots.forEach((bot) => {
          const willAnswerInTime = Math.random() > 0.15;
          const delay = willAnswerInTime
            ? Math.max(
                900,
                Math.min(
                  safeAnswerWindowMs,
                  Math.floor(durationMs * (0.2 + Math.random() * 0.55)),
                ),
              )
            : durationMs + 200;

          const answerTimer = setTimeout(() => {
            if (BotEngine.activeBots.length === 0) return;
            handleIncomingPacket({
              type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
              playerId: bot.id,
              round: packet.round,
              questionId: packet.questionId,
              isCorrect: willAnswerInTime ? Math.random() > 0.35 : false,
              timeTaken: delay,
              timestamp: Date.now(),
            });
          }, delay);
          BotEngine._answerTimers.push(answerTimer);
        });
      }
    });
    BotEngine._listeners.push(unsub);
  },
};
