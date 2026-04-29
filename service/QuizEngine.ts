import { MODES } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { updateDebugMetric } from "./observability/DebugService";
import { IGameEngine } from "./interfaces/IGameEngine";
import { GameSessionTransport } from "./network/GameSessionTransport";

type QuizPlayerScore = {
  id: string;
  name: string;
  avatarId: number;
  correctCount: number;
  totalTime: number;
  submissionTime?: string;
};

type AnswerPacket = {
  type: string;
  playerId: string;
  round?: number;
  questionId?: string;
  isCorrect?: boolean;
  timeTaken?: number;
  timestamp?: number;
  submissionTime?: string;
  authoritative?: boolean;
};

const DEFAULT_TOTAL_ROUNDS = 5;

/**
 * --- QUIZ ENGINE (Multiplayer Extension) ---
 * Adheres to LSP and DIP.
 * Implements IGameEngine for standardized packet routing.
 */
export const QuizEngine = {
  state: {
    difficulty: "easy" as any,
    currentRound: 1,
    totalRounds: DEFAULT_TOTAL_ROUNDS,
    playerScores: {} as Record<string, QuizPlayerScore>,
    roundAnswersReceived: 0,
    roundAnsweredIds: {} as Record<string, boolean>,
    isFinalRound: false,
    currentQuestion: null as any,
    currentQuestionId: null as string | null,
    roundStartedAt: null as number | null,
    roundDeadlineAt: null as number | null,
    stake: 0,
    totalPot: 0,
  },

  canHandle: (type: string) => {
    return (
      type === MODES.THINK_AND_COUNT.GAME_START ||
      type.startsWith(MODES.THINK_AND_COUNT.ANSWER_PREFIX) ||
      type === MODES.THINK_AND_COUNT.ANSWER_SUBMITTED ||
      type === MODES.THINK_AND_COUNT.QUESTION_SYNC ||
      type === "TC_ROUND_SUMMARY"
    );
  },

  reset: () => {
    console.log("[QuizEngine] Full state reset.");
    QuizEngine.state.difficulty = "easy";
    QuizEngine.state.currentRound = 1;
    QuizEngine.state.totalRounds = DEFAULT_TOTAL_ROUNDS;
    QuizEngine.state.playerScores = {};
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.roundAnsweredIds = {};
    QuizEngine.state.isFinalRound = false;
    QuizEngine.state.currentQuestion = null;
    QuizEngine.state.currentQuestionId = null;
    QuizEngine.state.roundStartedAt = null;
    QuizEngine.state.roundDeadlineAt = null;
    QuizEngine.state.stake = 0;
    QuizEngine.state.totalPot = 0;
  },

  init: (
    players: any[],
    difficulty: any,
    stake: number = 0,
    totalRounds: number = DEFAULT_TOTAL_ROUNDS,
  ) => {
    QuizEngine.reset();

    console.log("[QuizEngine] Initializing timer-enabled session.");
    QuizEngine.state.difficulty = difficulty;
    QuizEngine.state.totalRounds = totalRounds;
    QuizEngine.state.stake = stake;
    QuizEngine.state.totalPot = stake * players.length;

    if (__DEV__) {
      console.log(
        `[QuizEngine] Session config — totalRounds: ${totalRounds}, difficulty: ${difficulty}, stake: ${stake}, players: ${players.length}`,
      );
    }

    players.forEach((player) => {
      QuizEngine.state.playerScores[player.id] = {
        id: player.id,
        name: player.name,
        avatarId: player.avatarId || 1,
        correctCount: 0,
        totalTime: 0,
        submissionTime: "N/A",
      };
    });

    updateDebugMetric("quizDifficulty", difficulty);
  },

  processMultiplayer: (packet: any) => {
    switch (packet.type) {
      case MODES.THINK_AND_COUNT.GAME_START:
        QuizEngine.init(
          packet.players || [],
          packet.difficulty,
          packet.betAmount || 0,
          packet.totalRounds || DEFAULT_TOTAL_ROUNDS,
        );
        updateDebugMetric("quizDifficulty", packet.difficulty);
        break;

      case MODES.THINK_AND_COUNT.ANSWER_SUBMITTED:
        QuizEngine.handleAnswer(packet);
        break;

      case MODES.THINK_AND_COUNT.QUESTION_SYNC:
        QuizEngine.syncQuestion(packet);
        updateDebugMetric("quizRound", packet.round);
        break;

      case "TC_ROUND_SUMMARY":
        QuizEngine.applyRoundSummary(packet);
        break;
    }
  },

  syncQuestion: (packet: any) => {
    QuizEngine.state.currentQuestion = packet.question;
    QuizEngine.state.currentQuestionId = packet.questionId || null;
    QuizEngine.state.currentRound =
      packet.round || QuizEngine.state.currentRound;
    QuizEngine.state.roundStartedAt =
      packet.roundStartedAt || packet.serverNow || Date.now();
    QuizEngine.state.roundDeadlineAt =
      packet.deadlineAt ||
      (packet.roundStartedAt || packet.serverNow || Date.now()) +
        (packet.durationMs || 0);
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.roundAnsweredIds = {};
  },

  applyRoundSummary: (packet: any) => {
    QuizEngine.state.playerScores = (packet.leaderboard || []).reduce(
      (acc: Record<string, QuizPlayerScore>, player: any) => {
        acc[player.id] = {
          id: player.id,
          name: player.name,
          avatarId: player.avatarId,
          correctCount: player.correctCount ?? 0,
          totalTime: player.totalTime ?? 0,
          submissionTime: player.submissionTime ?? "N/A",
        };
        return acc;
      },
      {},
    );

    QuizEngine.state.currentRound = Math.max(
      QuizEngine.state.currentRound,
      (packet.round || 0) + 1,
    );
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.roundAnsweredIds = {};
    QuizEngine.state.currentQuestion = null;
    QuizEngine.state.currentQuestionId = null;
    QuizEngine.state.roundStartedAt = null;
    QuizEngine.state.roundDeadlineAt = null;
  },

  handleAnswer: (packet: AnswerPacket) => {
    const { playerId } = packet;
    const isHost = GameSessionTransport.getSnapshot().isHost;

    if (!playerId) return;

    if (QuizEngine.state.currentRound > QuizEngine.state.totalRounds) {
      if (__DEV__) {
        console.log(
          `[QuizEngine] Game over; ignoring late answer from: ${playerId}`,
        );
      }
      return;
    }

    // PROD-FIX: Strict round and question ID validation to prevent stale answers
    // from triggering premature round completion.
    if (
      typeof packet.round === "number" &&
      packet.round !== QuizEngine.state.currentRound
    ) {
      if (__DEV__) {
        console.log(
          `[QuizEngine] Ignoring stale round answer: ${packet.round} (current: ${QuizEngine.state.currentRound})`,
        );
      }
      return;
    }

    if (
      packet.questionId &&
      QuizEngine.state.currentQuestionId &&
      packet.questionId !== QuizEngine.state.currentQuestionId
    ) {
      if (__DEV__) {
        console.log(
          `[QuizEngine] Ignoring stale question answer: ${packet.questionId}`,
        );
      }
      return;
    }

    if (!QuizEngine.state.playerScores[playerId]) {
      if (__DEV__) {
        console.log(
          `[QuizEngine] Ignoring answer from unknown player: ${playerId}`,
        );
      }
      return;
    }

    // Authoritative check: Host must stamp all incoming answers
    if (!packet.authoritative) {
      if (!isHost) {
        return;
      }

      const roundStartedAt = QuizEngine.state.roundStartedAt ?? Date.now();
      const roundDeadlineAt =
        QuizEngine.state.roundDeadlineAt ?? roundStartedAt;
      const now = Date.now();
      const maxDuration = Math.max(0, roundDeadlineAt - roundStartedAt);
      const authoritativeTimeTaken = Math.max(
        0,
        Math.min(maxDuration, now - roundStartedAt),
      );

      const authoritativePacket: AnswerPacket = {
        ...packet,
        authoritative: true,
        isCorrect: now <= roundDeadlineAt ? !!packet.isCorrect : false,
        timeTaken: authoritativeTimeTaken,
        timestamp: now,
        submissionTime: new Date(now).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Process locally then broadcast
      QuizEngine.handleAnswer(authoritativePacket);
      GameSessionTransport.sendToClients(authoritativePacket);
      return;
    }

    // If we reach here, the packet is authoritative.
    // Duplicate guard: Only increment if this player hasn't answered this round.
    if (QuizEngine.state.roundAnsweredIds[playerId]) {
      return;
    }

    if (packet.isCorrect) {
      QuizEngine.state.playerScores[playerId].correctCount += 1;
    }

    QuizEngine.state.playerScores[playerId].totalTime += Math.max(
      0,
      packet.timeTaken || 0,
    );

    const date = packet.timestamp ? new Date(packet.timestamp) : new Date();
    QuizEngine.state.playerScores[playerId].submissionTime =
      packet.submissionTime ||
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    QuizEngine.state.roundAnsweredIds[playerId] = true;
    QuizEngine.state.roundAnswersReceived++;

    const totalPlayers = Object.keys(QuizEngine.state.playerScores).length;

    if (__DEV__) {
      console.log(
        `[QuizEngine] Progress: ${QuizEngine.state.roundAnswersReceived}/${totalPlayers} (Answer from: ${playerId})`,
      );
    }

    // Completion Check: Only finish if every player (bots + humans) has answered.
    if (
      totalPlayers > 0 &&
      QuizEngine.state.roundAnswersReceived >= totalPlayers
    ) {
      QuizEngine.completeRound();
    }
  },

  removePlayer: (playerId: string) => {
    if (!QuizEngine.state.playerScores[playerId]) {
      console.log(`[QuizEngine] removePlayer: ID not found ${playerId}`);
      return;
    }

    console.log(`[QuizEngine] Removing player: ${playerId}`);
    delete QuizEngine.state.playerScores[playerId];

    if (QuizEngine.state.roundAnsweredIds[playerId]) {
      QuizEngine.state.roundAnswersReceived = Math.max(
        0,
        QuizEngine.state.roundAnswersReceived - 1,
      );
      delete QuizEngine.state.roundAnsweredIds[playerId];
    }

    const totalPlayers = Object.keys(QuizEngine.state.playerScores).length;
    if (
      totalPlayers > 0 &&
      QuizEngine.state.roundAnswersReceived >= totalPlayers
    ) {
      QuizEngine.completeRound();
    }
  },

  completeRound: () => {
    if (__DEV__) {
      console.log(
        `[QuizEngine] completeRound — currentRound: ${QuizEngine.state.currentRound}, totalRounds: ${QuizEngine.state.totalRounds}`,
      );
    }

    const summaryPacket = {
      type: "TC_ROUND_SUMMARY",
      round: QuizEngine.state.currentRound,
      leaderboard: Object.entries(QuizEngine.state.playerScores)
        .map(([, stats]) => ({ ...stats }))
        .sort(
          (a, b) =>
            b.correctCount - a.correctCount || a.totalTime - b.totalTime,
        ),
      isLastRound:
        QuizEngine.state.currentRound >= QuizEngine.state.totalRounds,
    };

    QuizEngine.state.currentRound++;
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.roundAnsweredIds = {};
    QuizEngine.state.currentQuestion = null;
    QuizEngine.state.currentQuestionId = null;
    QuizEngine.state.roundStartedAt = null;
    QuizEngine.state.roundDeadlineAt = null;

    if (GameSessionTransport.getSnapshot().isHost) {
      PacketRouter.broadcast(summaryPacket);
    }
  },
};

PacketRouter.registerEngine(QuizEngine as IGameEngine);
