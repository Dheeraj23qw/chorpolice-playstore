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
    playerScores: {} as Record<string, { id: string, name: string, avatarId: number, score: number, totalTime: number, lastRoundTime: number, submissionTime?: string }>,
    roundAnswersReceived: 0,
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
   * Initializes the engine for a new session.
   */
  init: (players: any[], difficulty: any, stake: number = 0) => {
    console.log("🎮 [QuizEngine] Initializing. Stake:", stake);
    QuizEngine.state.difficulty = difficulty;
    QuizEngine.state.currentRound = 1;
    QuizEngine.state.roundAnswersReceived = 0;
    QuizEngine.state.playerScores = {};
    QuizEngine.state.stake = stake;
    QuizEngine.state.totalPot = stake * players.length;
    
    players.forEach(p => {
      QuizEngine.state.playerScores[p.id] = { 
        id: p.id,
        name: p.name, 
        avatarId: p.avatarId || 1,
        score: 0, 
        totalTime: 0,
        lastRoundTime: 0,
        submissionTime: "N/A"
      };
    });

    // Sync metadata
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
        updateDebugMetric("lastQuestionSync", `Round ${packet.round}`);
        break;
    }
  },

  /**
   * Handles individual player answers and updates scores.
   */
  handleAnswer: (packet: any) => {
    const { playerId, isCorrect, timeTaken } = packet;
    if (!QuizEngine.state.playerScores[playerId]) return;

    if (isCorrect) {
      const speedBonus = Math.max(0, 1000 - Math.floor(timeTaken / 10));
      QuizEngine.state.playerScores[playerId].score += speedBonus;
      QuizEngine.state.playerScores[playerId].lastRoundTime = timeTaken;
      
      const date = packet.timestamp ? new Date(packet.timestamp) : new Date();
      QuizEngine.state.playerScores[playerId].submissionTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    QuizEngine.state.roundAnswersReceived++;

    const totalPlayers = Object.keys(QuizEngine.state.playerScores).length;
    if (QuizEngine.state.roundAnswersReceived >= totalPlayers) {
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
      leaderboard: Object.entries(QuizEngine.state.playerScores)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.score - a.score),
      isLastRound: QuizEngine.state.currentRound >= QuizEngine.state.totalRounds
    };

    // Use Router for OCP-compliant broadcast
    PacketRouter.broadcast(summaryPacket);

    QuizEngine.state.currentRound++;
    QuizEngine.state.roundAnswersReceived = 0;
  }
};

// 🖇️ SELF-REGISTRATION (OCP)
PacketRouter.registerEngine(QuizEngine as IGameEngine);
