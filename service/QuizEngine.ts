import { MODES } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { updateDebugMetric } from "./observability/DebugService";
import { IGameEngine } from "./interfaces/IGameEngine";

/**
 * --- QUIZ ENGINE (Multiplayer Extension) ---
 * Adheres to LSP and DIP.
 * Implements IGameEngine for standardized packet routing.
 */
export const QuizEngine = {
  state: {
    difficulty: "easy" as any,
    currentRound: 1,
    totalRounds: 7,
    playerScores: {} as Record<string, { id: string, name: string, avatarId: number, correctCount: number, totalTime: number, submissionTime?: string }>,
    roundAnswersReceived: 0,
    roundAnsweredIds: {} as Record<string, boolean>, // 🛡️ Round-specific tracking
    isFinalRound: false,
    currentQuestion: null as any,
    stake: 0,
    totalPot: 0,
  },

  /**
   * Registry Method (OCP)
   */
  canHandle: (type: string) => {
    return type === MODES.THINK_AND_COUNT.GAME_START || 
           type.startsWith(MODES.THINK_AND_COUNT.ANSWER_PREFIX) || 
           type === MODES.THINK_AND_COUNT.ANSWER_SUBMITTED ||
           type === "TC_QUESTION_SYNC" ||
           type === "TC_ROUND_SUMMARY";
  },

  /**
   * 🧹 Full state reset — MUST be called before every new session.
   * WHY: Without this, playerScores, currentRound, totalPot, etc.
   * carry over from the previous game into the new lobby.
   */
  reset: () => {
    console.log("🧹 [QuizEngine] Full state reset.");
    QuizEngine.state.difficulty = "easy";
    QuizEngine.state.currentRound = 1;
    QuizEngine.state.totalRounds = 7;
    QuizEngine.state.playerScores = {};
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.roundAnsweredIds = {};
    QuizEngine.state.isFinalRound = false;
    QuizEngine.state.currentQuestion = null;
    QuizEngine.state.stake = 0;
    QuizEngine.state.totalPot = 0;
  },

  /**
   * Initializes the engine for a new session.
   */
  init: (players: any[], difficulty: any, stake: number = 0) => {
    // Always reset first to wipe any stale state
    QuizEngine.reset();

    console.log("🎮 [QuizEngine] Initializing Timer-Enabled Session.");
    QuizEngine.state.difficulty = difficulty;
    QuizEngine.state.stake = stake;
    QuizEngine.state.totalPot = stake * players.length;
    
    players.forEach(p => {
      QuizEngine.state.playerScores[p.id] = { 
        id: p.id,
        name: p.name, 
        avatarId: p.avatarId || 1,
        correctCount: 0,
        totalTime: 0,
        submissionTime: "N/A"
      };
    });

    updateDebugMetric("quizDifficulty", difficulty);
  },

  /**
   * Processes incoming multiplayer packets (IGameEngine implementation).
   */
  processMultiplayer: (packet: any, sourceIp?: string) => {
    switch (packet.type) {
      case MODES.THINK_AND_COUNT.GAME_START:
        QuizEngine.state.difficulty = packet.difficulty;
        QuizEngine.state.stake = packet.betAmount || 0;
        QuizEngine.state.totalPot = QuizEngine.state.stake * (packet.playerCount || 1);
        updateDebugMetric("quizDifficulty", packet.difficulty);
        break;

      case MODES.THINK_AND_COUNT.ANSWER_SUBMITTED:
        QuizEngine.handleAnswer(packet);
        break;
      
      case MODES.THINK_AND_COUNT.QUESTION_SYNC:
        updateDebugMetric("quizRound", packet.round);
        break;
    }
  },

  /**
   * Handles individual player answers and updates counts.
   * WHY: Ranking primarily by correctness, TIES broken by speed (totalTime).
   */
  handleAnswer: (packet: any) => {
    const { playerId, isCorrect, timeTaken } = packet;

    // 🛡️ GAME OVER GUARD: Reject answers after all rounds are complete
    if (QuizEngine.state.currentRound > QuizEngine.state.totalRounds) {
      console.log(`🛡️ [QuizEngine] Game over — ignoring late answer from: ${playerId}`);
      return;
    }
    
    // 🛡️ User Request Fix: No multiple answers per round
    if (!QuizEngine.state.playerScores[playerId] || QuizEngine.state.roundAnsweredIds[playerId]) {
       console.log(`🛡️ [QuizEngine] Ignoring duplicate/invalid answer from: ${playerId}`);
       return;
    }

    if (isCorrect) {
      QuizEngine.state.playerScores[playerId].correctCount += 1;
    }

    // Always accumulate time for tie-breaking as per User Request
    QuizEngine.state.playerScores[playerId].totalTime += (timeTaken || 0);
    
    const date = packet.timestamp ? new Date(packet.timestamp) : new Date();
    QuizEngine.state.playerScores[playerId].submissionTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Mark as answered for this round
    QuizEngine.state.roundAnsweredIds[playerId] = true;
    QuizEngine.state.roundAnswersReceived++;

    const totalPlayers = Object.keys(QuizEngine.state.playerScores).length;
    if (QuizEngine.state.roundAnswersReceived >= totalPlayers) {
      QuizEngine.completeRound();
    }
  },

  /**
   * Removes a player from the active session mid-game.
   * WHY: If a non-host player leaves, the game must continue for everyone else.
   * The engine adjusts round tracking so the remaining players aren't stuck
   * waiting for an answer that will never arrive.
   */
  removePlayer: (playerId: string) => {
    if (!QuizEngine.state.playerScores[playerId]) {
      console.log(`🛡️ [QuizEngine] removePlayer — ID not found: ${playerId}`);
      return;
    }

    console.log(`🚪 [QuizEngine] Removing player: ${playerId}`);
    delete QuizEngine.state.playerScores[playerId];

    // If this player already answered this round, decrement the counter
    if (QuizEngine.state.roundAnsweredIds[playerId]) {
      QuizEngine.state.roundAnswersReceived = Math.max(0, QuizEngine.state.roundAnswersReceived - 1);
      delete QuizEngine.state.roundAnsweredIds[playerId];
    }

    // Check if all REMAINING players have now answered (removal may trigger round completion)
    const totalPlayers = Object.keys(QuizEngine.state.playerScores).length;
    if (totalPlayers > 0 && QuizEngine.state.roundAnswersReceived >= totalPlayers) {
      QuizEngine.completeRound();
    }
  },

  /**
   * Finalizes the current round and broadcasts summary.
   */
  completeRound: () => {
    const summaryPacket = {
      type: "TC_ROUND_SUMMARY",
      round: QuizEngine.state.currentRound,
      // 🏆 TIE-BREAKER: Sort by correctCount (DESC), then totalTime (ASC)
      leaderboard: Object.entries(QuizEngine.state.playerScores)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => (b.correctCount - a.correctCount) || (a.totalTime - b.totalTime)),
      isLastRound: QuizEngine.state.currentRound >= QuizEngine.state.totalRounds
    };

    PacketRouter.broadcast(summaryPacket);

    // Reset round-specific state
    QuizEngine.state.currentRound++;
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.roundAnsweredIds = {};
  }
};

// 🖇️ SELF-REGISTRATION (OCP)
PacketRouter.registerEngine(QuizEngine as IGameEngine);
