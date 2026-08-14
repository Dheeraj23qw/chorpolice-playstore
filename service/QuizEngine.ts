import { MODES, NETWORK } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { updateDebugMetric } from "./observability/DebugService";
import { IGameEngine } from "./interfaces/IGameEngine";
import { GameSessionTransport } from "./network/GameSessionTransport";
import store from "@/redux/store";
import { 
  initMatchEconomy, 
  setSettlementStatus 
} from "@/redux/reducers/sessionSlice";
import { 
  setRoundActive,
  setStake as setReduxStake,
} from "@/redux/reducers/sessionSlice";
import { selectIsReconnectActive } from "@/redux/reducers/reconnectSlice";

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
  optionIndex?: number;
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
  engineName: "QuizEngine",
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
    matchId: null as string | null,
  },

  _safetyTimer: null as ReturnType<typeof setTimeout> | null,

  canHandle: (type: string) => {
    return (
      type === MODES.THINK_AND_COUNT.GAME_START ||
      type.startsWith(MODES.THINK_AND_COUNT.ANSWER_PREFIX) ||
      type === MODES.THINK_AND_COUNT.ANSWER_SUBMITTED ||
      type === MODES.THINK_AND_COUNT.QUESTION_SYNC ||
      type === "TC_ROUND_SUMMARY" ||
      type === NETWORK.SYNC_STATE
    );
  },

  reset: () => {
    console.log("[QuizEngine] Full state reset.");
    if (QuizEngine._safetyTimer) {
      clearTimeout(QuizEngine._safetyTimer);
      QuizEngine._safetyTimer = null;
    }
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
    QuizEngine.state.matchId = null;
  },

  init: (
    players: any[],
    difficulty: any,
    stake: number = 0,
    totalRounds: number = DEFAULT_TOTAL_ROUNDS,
    matchId?: string,
  ) => {
    QuizEngine.reset();

    console.log("[QuizEngine] Initializing timer-enabled session.");
    QuizEngine.state.difficulty = difficulty;
    QuizEngine.state.totalRounds = totalRounds;
    QuizEngine.state.stake = stake;
    QuizEngine.state.totalPot = stake * players.length;

    const isHost = GameSessionTransport.getSnapshot().isHost || store.getState().session.isHost;
    const finalMatchId = matchId || (isHost ? `TC_${Date.now()}_${Math.floor(Math.random() * 1000)}` : null);
    if (finalMatchId) {
      QuizEngine.state.matchId = finalMatchId;
      store.dispatch(initMatchEconomy({
        matchId: finalMatchId,
        stakeAmount: stake,
      }));
    }

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
    // 🔥 PAUSE GUARD: Block all gameplay processing while reconnect is active
    if (selectIsReconnectActive(store.getState())) {
      console.log(`[QuizEngine] ⏸️ Packet ${packet.type} deferred (reconnect active)`);
      return;
    }

    switch (packet.type) {
      case MODES.THINK_AND_COUNT.GAME_START:
        {
          const players = packet.players || [];
          const diff = packet.difficulty || "easy";
          const stake = packet.stake || packet.betAmount || 0;
          const totalRounds = packet.totalRounds || DEFAULT_TOTAL_ROUNDS;

          QuizEngine.init(players, diff, stake, totalRounds, packet.matchId);
        }
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

      case NETWORK.PLAYER_LEAVE:
        if (packet.playerId) {
          QuizEngine.removePlayer(packet.playerId);
        }
        break;

      case NETWORK.SYNC_STATE:
        if (packet.quizState) {
          QuizEngine.handleSyncState(packet.quizState);
        }
        break;
    }
  },

  handleSyncState: (packet: any) => {
    const s = packet.engineState || packet.quizState || packet;
    if (!s) return;
    console.log("[QuizEngine] 🔄 Syncing quiz state from host.");
    QuizEngine.state.difficulty = s.difficulty || QuizEngine.state.difficulty;
    QuizEngine.state.currentRound = s.currentRound || QuizEngine.state.currentRound;
    QuizEngine.state.totalRounds = s.totalRounds || QuizEngine.state.totalRounds;
    QuizEngine.state.playerScores = s.playerScores || QuizEngine.state.playerScores;
    QuizEngine.state.currentQuestion = s.currentQuestion || QuizEngine.state.currentQuestion;
    QuizEngine.state.currentQuestionId = s.currentQuestionId || QuizEngine.state.currentQuestionId;
    QuizEngine.state.roundDeadlineAt = s.roundDeadlineAt || QuizEngine.state.roundDeadlineAt;
    QuizEngine.state.stake = s.stake ?? QuizEngine.state.stake;
    QuizEngine.state.totalPot = s.totalPot ?? QuizEngine.state.totalPot;
    QuizEngine.state.matchId = s.matchId || QuizEngine.state.matchId;

    if (QuizEngine.state.matchId) {
      store.dispatch(initMatchEconomy({
        matchId: QuizEngine.state.matchId,
        stakeAmount: QuizEngine.state.stake,
      }));
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

    // 🔥 Safety Timer (Host Only): If players get stuck (e.g. disconnect),
    // force the round to complete after the duration + a small buffer.
    const isHost = GameSessionTransport.getSnapshot().isHost || store.getState().session.isHost;
    if (isHost) {
      if (QuizEngine._safetyTimer) clearTimeout(QuizEngine._safetyTimer);
      
      const durationMs = packet.durationMs || 10000;
      QuizEngine._safetyTimer = setTimeout(() => {
        // 🔥 PAUSE GUARD: If reconnecting, defer safety timeout
        if (selectIsReconnectActive(store.getState())) {
           console.log(`[QuizEngine] ⏱️ Safety timeout deferred (reconnect active)`);
           return;
        }
        if (QuizEngine.state.currentRound > QuizEngine.state.totalRounds) return;
        console.log(`[QuizEngine] ⏱️ Safety timeout reached for round ${QuizEngine.state.currentRound}. Forcing completion.`);
        QuizEngine.completeRound();
      }, durationMs + 4000); // 4s buffer for network jitter/lag
    }
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

    if (QuizEngine._safetyTimer) {
      clearTimeout(QuizEngine._safetyTimer);
      QuizEngine._safetyTimer = null;
    }
  },

  handleAnswer: (packet: AnswerPacket) => {
    const { playerId } = packet;
    const isHost = GameSessionTransport.getSnapshot().isHost || store.getState().session.isHost;

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

    // ── ANSWER_SUBMITTED SECURITY & VALIDATION ──
    const state = QuizEngine.state;

    // 1. Reject if player is not in current match
    if (!state.playerScores[playerId]) {
      if (__DEV__) console.log(`[QuizEngine] Reject: Unknown player ${playerId}`);
      return;
    }

    // 2. Reject if stale questionId
    if (packet.questionId && state.currentQuestionId && packet.questionId !== state.currentQuestionId) {
      if (__DEV__) console.log(`[QuizEngine] Reject: Stale questionId ${packet.questionId}`);
      return;
    }

    // 3. Reject duplicate answer
    if (state.roundAnsweredIds[playerId]) {
      if (__DEV__) console.log(`[QuizEngine] Reject: Duplicate answer from ${playerId}`);
      return;
    }

    // 4. Host-Authoritative validation
    if (!packet.authoritative) {
      if (!isHost) return;

      const roundStartedAt = state.roundStartedAt ?? Date.now();
      const roundDeadlineAt = state.roundDeadlineAt ?? roundStartedAt;
      const now = Date.now();

      // 5. Reject if timer expired (500ms grace period for network jitter)
      if (now > roundDeadlineAt + 500) {
        if (__DEV__) console.log(`[QuizEngine] Reject: Timer expired for ${playerId}`);
        return;
      }

      // 6. Calculate correctness internally
      let calculatedCorrect = false;
      if (typeof packet.optionIndex === "number" && state.currentQuestion) {
        const q = state.currentQuestion;
        // 7. Validate optionIndex bounds
        if (packet.optionIndex >= 0 && packet.optionIndex < q.options.length) {
          calculatedCorrect = q.options[packet.optionIndex] === q.correctAnswer;
        } else {
          if (__DEV__) console.log(`[QuizEngine] Reject: Invalid optionIndex ${packet.optionIndex}`);
          return;
        }
      } else {
        // "DO NOT trust incoming isCorrect from client/bot packets."
        if (__DEV__) console.log(`[QuizEngine] Reject: Missing optionIndex or question context`);
        return;
      }

      const maxDuration = Math.max(0, roundDeadlineAt - roundStartedAt);
      const authoritativeTimeTaken = Math.max(0, Math.min(maxDuration, now - roundStartedAt));

      const authoritativePacket: AnswerPacket = {
        ...packet,
        authoritative: true,
        isCorrect: calculatedCorrect,
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
    if (QuizEngine._safetyTimer) {
      clearTimeout(QuizEngine._safetyTimer);
      QuizEngine._safetyTimer = null;
    }

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

    const isHost = GameSessionTransport.getSnapshot().isHost || store.getState().session.isHost;
    if (isHost) {
      PacketRouter.broadcast(summaryPacket);
    }
  },

  handleReconnectStatus: (playerId: string, isReconnecting: boolean) => {
    console.log(`[QuizEngine] Player ${playerId} reconnecting status: ${isReconnecting}`);
    // No specific bot logic needed for T&C here yet
  },
};

PacketRouter.registerEngine(QuizEngine as IGameEngine);
