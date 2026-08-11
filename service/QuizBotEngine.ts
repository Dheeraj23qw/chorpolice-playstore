import { NETWORK, MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";
import { getBotName, preloadBotNames } from "../utils/nameGenerator";
import { SessionPlayer } from "@/redux/reducers/sessionSlice";
import { customAlphabet } from "nanoid/non-secure";

/**
 * @module BotEngine
 * @description Manages QUIZ BOT players.
 * ONLY runs on the HOST device to ensure a single source of truth.
 */

const generateShortId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  8,
);

export const BotEngine = {
  activeBots: [] as SessionPlayer[],
  _listeners: [] as (() => void)[],
  _joinTimers: [] as ReturnType<typeof setTimeout>[],
  _answerTimers: [] as ReturnType<typeof setTimeout>[],
  _lastQuestionId: null as string | null,

  prepareEngine: (_count: number) => {
    BotEngine.clearAnswerTimers();
    void preloadBotNames(Math.max(20, _count * 2));
  },

  reset: () => {
    BotEngine._listeners.forEach((unsub) => unsub());
    BotEngine._listeners = [];
    BotEngine._joinTimers.forEach(clearTimeout);
    BotEngine._joinTimers = [];
    BotEngine.clearAnswerTimers();
    BotEngine.activeBots = [];
    BotEngine._lastQuestionId = null;
  },

  clearAnswerTimers: () => {
    BotEngine._answerTimers.forEach(clearTimeout);
    BotEngine._answerTimers = [];
  },

  generateBots: (count: number): SessionPlayer[] => {
    const usedAvatars = new Set<number>();
    const bots: SessionPlayer[] = [];

    const getAvatar = () => {
      let id: number;
      let attempts = 0;
      do {
        id = Math.floor(Math.random() * 13) + 1;
        attempts++;
      } while (usedAvatars.has(id) && attempts < 50); // Robustness: prevent infinite loops
      usedAvatars.add(id);
      return id;
    };

    for (let i = 0; i < count; i++) {
      const botName = getBotName(i);
      bots.push({
        id: `CP-BOT-${generateShortId()}`,
        name: botName,
        avatarId: getAvatar(),
        coins: 0,
        type: "CLIENT",
        isBot: true,
      });
    }

    BotEngine.activeBots = bots;
    return bots;
  },

  start: () => {
    if (BotEngine._listeners.length > 0) return;
    BotEngine.initializeListeners();
  },

  /**
   * @function updateActiveBots
   * @description Syncs the internal bot list with the Redux state.
   * If a bot was replaced by a real human, this ensures the bot stops answering.
   */
  updateActiveBots: (currentPlayersInRedux: SessionPlayer[]) => {
    const nextBots = currentPlayersInRedux.filter((p) => p.isBot);
    // If bots were removed (e.g. 2 humans joined), clear any pending answer timers
    if (nextBots.length === 0 && BotEngine.activeBots.length > 0) {
      BotEngine.clearAnswerTimers();
    }
    BotEngine.activeBots = nextBots;
  },

  initializeListeners: () => {
    const unsub = subscribeToPackets((packet) => {
      try {
        if (packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC) {
          const { questionId, round, durationMs = 10000, question } = packet;
          const qKey = questionId || `round-${round || 0}`;

          if (BotEngine._lastQuestionId === qKey) return;
          BotEngine._lastQuestionId = qKey;

          // Clear previous round timers immediately
          BotEngine._answerTimers.forEach(clearTimeout);
          BotEngine._answerTimers = [];

          // Determine number of options dynamically
          const optionsLength = Array.isArray(question?.options)
            ? question.options.length
            : typeof packet.optionsLength === "number"
              ? packet.optionsLength
              : 0;

          if (!Number.isFinite(optionsLength) || optionsLength <= 0) {
            console.log("[BotEngine] Skip answer: invalid optionsLength", optionsLength);
            return;
          }

          BotEngine.activeBots.forEach((bot) => {
            const delay = Math.floor(Math.random() * 1000 + 2000);

            const timer = setTimeout(() => {
              // RE-CHECK: Ensure bot still active, match hasn't changed, and questionId matches
              if (!BotEngine.activeBots.some((b) => b.id === bot.id)) return;
              if (BotEngine._lastQuestionId !== qKey) return;

              const optionIndex = Math.floor(Math.random() * optionsLength);

              handleIncomingPacket({
                type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
                playerId: bot.id,
                questionId: qKey,
                optionIndex,
                timeTaken: delay,
                timestamp: Date.now(),
              });
            }, delay);

            BotEngine._answerTimers.push(timer);
          });
        }
      } catch (error) {
        console.error("BotEngine Listener Error:", error);
      }
    });
    BotEngine._listeners.push(unsub);
  },
};
