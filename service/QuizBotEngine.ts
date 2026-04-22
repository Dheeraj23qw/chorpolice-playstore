import { NETWORK, MODES } from "../constants/Networking";
import { handleIncomingPacket, subscribeToPackets } from "./lanGameService";
import { getBotName } from "../utils/nameGenerator";
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
    // The current LAN flow instantiates bots from lobby state,
    // so prewarming is intentionally a no-op.
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
    BotEngine.activeBots = currentPlayersInRedux.filter((p) => p.isBot);
  },

  initializeListeners: () => {
    const unsub = subscribeToPackets((packet) => {
      try {
        if (packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC) {
          const { questionId, round, durationMs = 10000 } = packet;
          const qKey = questionId || `round-${round || 0}`;

          if (BotEngine._lastQuestionId === qKey) return;
          BotEngine._lastQuestionId = qKey;

          // Clear previous round timers immediately
          BotEngine._answerTimers.forEach(clearTimeout);
          BotEngine._answerTimers = [];

          BotEngine.activeBots.forEach((bot) => {
            const willAnswerInTime = Math.random() > 0.12; // Slightly higher engagement

            // "Pro" global timing: 10% - 40% of duration
            const delay = willAnswerInTime
              ? Math.floor(durationMs * (0.1 + Math.random() * 0.3))
              : durationMs + 200;

            const timer = setTimeout(() => {
              // ROBUSTNESS CHECK: Ensure bot still exists and game hasn't reset
              if (!BotEngine.activeBots.some((b) => b.id === bot.id)) return;

              handleIncomingPacket({
                type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
                playerId: bot.id,
                isCorrect: Math.random() > 0.35, // Balanced difficulty
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
