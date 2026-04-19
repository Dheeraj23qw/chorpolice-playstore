import { MODES } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { IGameEngine } from "./interfaces/IGameEngine";

/**
 * --- CHOR POLICE ENGINE (Multiplayer) ---
 * Implements IGameEngine for standardized packet routing.
 *
 * Responsibilities:
 * - Role assignment (shuffle King/Police/Thief/Advisor among 4 players)
 * - Police guess evaluation
 * - Per-round scoring
 * - Round progression & game end detection
 *
 * SOLID:
 * - SRP: Only game rules — no UI, no bot logic, no networking I/O.
 * - OCP: Self-registers with PacketRouter. Adding new packet types doesn't modify the router.
 * - LSP: Implements IGameEngine identically to QuizEngine.
 * - DIP: Communicates exclusively through PacketRouter.broadcast().
 */

const ROLES = ["King", "Police", "Thief", "Advisor"] as const;
type Role = (typeof ROLES)[number];

interface CPPlayer {
  id: string;
  name: string;
  avatarId: number;
  isBot?: boolean;
}

interface CPScoreEntry {
  id: string;
  name: string;
  avatarId: number;
  totalScore: number;
  roundScores: number[];
}

export const ChorPoliceEngine = {
  state: {
    players: [] as CPPlayer[],
    roles: [] as Role[],          // roles[i] = role of players[i]
    currentRound: 1,
    totalRounds: 5,
    scores: {} as Record<string, CPScoreEntry>,
    stake: 0,
    totalPot: 0,
    policeIndex: -1,
    kingIndex: -1,
    thiefIndex: -1,
    advisorIndex: -1,
    isRoundActive: false,
  },

  /* ─── IGameEngine: canHandle ─── */
  canHandle: (type: string): boolean => {
    return type.startsWith("CP_");
  },

  /* ─── IGameEngine: processMultiplayer ─── */
  processMultiplayer: (packet: any, _sourceIp?: string): void => {
    const CP = MODES.CHOR_POLICE;

    console.log(`🎭 [CPEngine] ⬇️ Processing packet: ${packet.type}`, JSON.stringify(packet).substring(0, 120));

    switch (packet.type) {
      case CP.GAME_START:
        // Session initialized — do NOT auto-start the first round.
        // The host must click "Play" which sends CP_ROUND_START.
        console.log(`🎭 [CPEngine] 🟢 GAME_START received — session ready. Waiting for host to click Play.`);
        break;

      case CP.POLICE_GUESS:
        console.log(`🎭 [CPEngine] 🎯 POLICE_GUESS received — target index: ${packet.targetIndex}`);
        ChorPoliceEngine.evaluateGuess(packet.targetIndex);
        break;

      case CP.ROUND_START:
        console.log(`🎭 [CPEngine] ▶️ ROUND_START received — starting round ${ChorPoliceEngine.state.currentRound}`);
        if (ChorPoliceEngine.state.isRoundActive) {
          console.warn(
            "ðŸ›¡ï¸ [CPEngine] Duplicate ROUND_START ignored â€” round already active.",
          );
          break;
        }
        ChorPoliceEngine.startRound();
        break;

      case CP.PUBLIC_REVEAL:
        ChorPoliceEngine.state.currentRound =
          packet.round ?? ChorPoliceEngine.state.currentRound;
        ChorPoliceEngine.state.policeIndex =
          packet.policeIndex ?? ChorPoliceEngine.state.policeIndex;
        ChorPoliceEngine.state.kingIndex =
          packet.kingIndex ?? ChorPoliceEngine.state.kingIndex;
        ChorPoliceEngine.state.isRoundActive = true;
        break;

      case CP.ROUND_RESULT:
        ChorPoliceEngine.state.isRoundActive = false;
        ChorPoliceEngine.state.currentRound =
          (packet.round ?? ChorPoliceEngine.state.currentRound) + 1;
        ChorPoliceEngine.state.roles =
          packet.allRoles?.map((entry: any) => entry.role) ??
          ChorPoliceEngine.state.roles;
        ChorPoliceEngine.syncScores(packet.leaderboard);
        break;

      case CP.SCORE_GUESS_RESULT:
        ChorPoliceEngine.syncScores(packet.leaderboard);
        break;

      case CP.GAME_END:
        console.log(`🎭 [CPEngine] 🛑 GAME_END received — reason: ${packet.reason}`);
        break;

      default:
        console.log(`🎭 [CPEngine] ⚠️ Unhandled CP packet type: ${packet.type}`);
        break;
    }
  },

  /* ─── Initialize a new session ─── */
  init: (players: CPPlayer[], stake: number, totalRounds: number = 5): void => {
    ChorPoliceEngine.reset();

    // 🛡️ VALIDATION: Chor Police requires EXACTLY 4 players
    if (ChorPoliceEngine.state.isRoundActive) {
      console.warn("ðŸ›¡ï¸ [CPEngine] Duplicate ROUND_START ignored â€” round already active.");
      return;
    }

    if (ChorPoliceEngine.state.isRoundActive) {
      console.warn(
        "ðŸ›¡ï¸ [CPEngine] Duplicate ROUND_START ignored â€” round already active.",
      );
      return;
    }

    if (players.length !== 4) {
      console.error(
        `🚨 [CPEngine] CRITICAL: init() called with ${players.length} players — expected exactly 4! Game will not function correctly.`,
      );
    }

    console.log(`🎭 [CPEngine] Initializing session — ${players.length} players, stake: ${stake}, rounds: ${totalRounds}`);
    console.log(`🎭 [CPEngine]   Humans: ${players.filter((p) => !p.isBot).map((p) => p.name).join(', ') || 'none'}`);
    console.log(`🎭 [CPEngine]   Bots: ${players.filter((p) => p.isBot).map((p) => p.name).join(', ') || 'none'}`);

    ChorPoliceEngine.state.players = [...players];
    ChorPoliceEngine.state.stake = stake;
    ChorPoliceEngine.state.totalPot = stake * players.length;
    ChorPoliceEngine.state.totalRounds = totalRounds;
    ChorPoliceEngine.state.currentRound = 1;

    // Initialize score entries
    players.forEach((p) => {
      ChorPoliceEngine.state.scores[p.id] = {
        id: p.id,
        name: p.name,
        avatarId: p.avatarId,
        totalScore: 0,
        roundScores: [],
      };
    });
  },

  /* ─── Shuffle & assign roles for the current round ─── */
  startRound: (): void => {
    const { players, currentRound, totalRounds } = ChorPoliceEngine.state;

    if (currentRound > totalRounds) {
      ChorPoliceEngine.endGame();
      return;
    }

    // 🛡️ GUARD: Must have exactly 4 players for role assignment
    if (players.length !== 4) {
      console.error(`🚨 [CPEngine] startRound aborted — ${players.length} players (need 4)`);
      return;
    }

    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);
    console.log(`🎭 [CPEngine] Starting Round ${currentRound}/${totalRounds}`);
    console.log(`🎭 [CPEngine] Players: [${players.map(p => `${p.name}(${p.id}${p.isBot ? ",bot" : ""})`).join(", ")}]`);

    // Fisher-Yates shuffle (deterministic per round)
    const shuffled: Role[] = [...ROLES];
    const seed = ChorPoliceEngine.state.currentRound * 7919 + ChorPoliceEngine.state.players.length * 104729;
    let s = seed;
    const rand = (): number => {
      s = (1664525 * s + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    ChorPoliceEngine.state.roles = shuffled;
    ChorPoliceEngine.state.policeIndex = shuffled.indexOf("Police");
    ChorPoliceEngine.state.kingIndex = shuffled.indexOf("King");
    ChorPoliceEngine.state.thiefIndex = shuffled.indexOf("Thief");
    ChorPoliceEngine.state.advisorIndex = shuffled.indexOf("Advisor");
    ChorPoliceEngine.state.isRoundActive = true;

    // Log role assignments
    players.forEach((p, i) => {
      console.log(`🎭 [CPEngine]   ${p.name} → ${shuffled[i]}${p.id === "host_id" ? " (LOCAL PLAYER)" : ""}`);
    });
    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);

    const CP = MODES.CHOR_POLICE;

    // 1. Send private role to each player
    players.forEach((player, index) => {
      PacketRouter.broadcast({
        type: CP.ROLE_ASSIGN,
        playerId: player.id,
        playerIndex: index,
        role: shuffled[index],
        round: currentRound,
      });
    });

    // 2. Broadcast public info (King & Police identities)
    const policeIdx = ChorPoliceEngine.state.policeIndex;
    const kingIdx = ChorPoliceEngine.state.kingIndex;

    PacketRouter.broadcast({
      type: CP.PUBLIC_REVEAL,
      kingId: players[kingIdx].id,
      policeId: players[policeIdx].id,
      kingName: players[kingIdx].name,
      policeName: players[policeIdx].name,
      kingIndex: kingIdx,
      policeIndex: policeIdx,
      round: currentRound,
      // Send full player list for UI rendering
      players: players.map((p, i) => ({
        id: p.id,
        name: p.name,
        avatarId: p.avatarId,
        isPublic: i === kingIdx || i === policeIdx,
      })),
    });
  },

  /* ─── Evaluate the Police player's guess ─── */
  evaluateGuess: (targetIndex: number): void => {
    if (!ChorPoliceEngine.state.isRoundActive) {
      console.log("🛡️ [CPEngine] Ignoring duplicate guess — round not active.");
      return;
    }

    // ✅ FIX: Reject guesses on already-revealed cards (King/Police)
    // Bots should only click hidden cards (Thief/Advisor positions)
    const { policeIndex, kingIndex } = ChorPoliceEngine.state;
    if (targetIndex === policeIndex || targetIndex === kingIndex) {
      console.log(`🛡️ [CPEngine] Ignoring guess on revealed card — index ${targetIndex} is ${targetIndex === policeIndex ? 'Police' : 'King'}`);
      return;
    }
    if (targetIndex < 0 || targetIndex > 3) {
      console.log(`🛡️ [CPEngine] Ignoring out-of-range guess — index ${targetIndex}`);
      return;
    }

    ChorPoliceEngine.state.isRoundActive = false;

    const { roles, players, currentRound, scores } = ChorPoliceEngine.state;
    const guessedRole = roles[targetIndex];
    const correct = guessedRole === "Thief";

    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);
    console.log(`🎭 [CPEngine] POLICE GUESS EVALUATION`);
    console.log(`🎭 [CPEngine]   Target index : ${targetIndex}`);
    console.log(`🎭 [CPEngine]   Target role  : ${guessedRole}`);
    console.log(`🎭 [CPEngine]   Correct      : ${correct ? "✅ YES (caught thief!)" : "❌ NO (thief escaped)"}`);
    console.log(`🎭 [CPEngine]   Round        : ${currentRound}`);
    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);

    // Scoring: per the existing offline logic
    const pointMap: Record<Role, number> = correct
      ? { King: 1000, Advisor: 800, Police: 500, Thief: 0 }
      : { King: 1000, Advisor: 800, Police: 0, Thief: 500 };

    // Apply scores
    players.forEach((player, index) => {
      const role = roles[index];
      const points = pointMap[role];
      if (scores[player.id]) {
        scores[player.id].totalScore += points;
        scores[player.id].roundScores.push(points);
        console.log(`🎭 [CPEngine]   ${player.name} (${role}): +${points} → total: ${scores[player.id].totalScore}`);
      }
    });

    // Broadcast result to all players
    const CP = MODES.CHOR_POLICE;
    const leaderboard = Object.values(scores)
      .sort((a, b) => b.totalScore - a.totalScore);

    PacketRouter.broadcast({
      type: CP.ROUND_RESULT,
      correct,
      guessedIndex: targetIndex,
      guessedRole,
      round: currentRound,
      allRoles: roles.map((role, i) => ({
        playerIndex: i,
        playerId: players[i].id,
        playerName: players[i].name,
        role,
      })),
      leaderboard,
      isLastRound: currentRound >= ChorPoliceEngine.state.totalRounds,
    });

    // The ROUND_RESULT packet is also processed locally on the host via the
    // packet router, so currentRound is advanced there exactly once for both
    // host and clients. Do not increment it again here or the host will skip
    // rounds and may jump past the score-quiz handoff.
  },

  /* ─── End game ─── */
  endGame: (): void => {
    console.log("🏁 [CPEngine] Game Over!");

    PacketRouter.broadcast({
      type: MODES.CHOR_POLICE.GAME_END,
      reason: "completed",
      leaderboard: ChorPoliceEngine.getLeaderboard(),
      totalPot: ChorPoliceEngine.state.totalPot,
    });
  },

  /* ─── Full state reset ─── */
  applyQuizBonus: (playerId: string, bonus: number): void => {
    const entry = ChorPoliceEngine.state.scores[playerId];
    if (!entry) {
      return;
    }

    entry.totalScore += bonus;
  },

  syncScores: (leaderboard: CPScoreEntry[] = []): void => {
    leaderboard.forEach((entry) => {
      const localEntry = ChorPoliceEngine.state.scores[entry.id];
      if (!localEntry) {
        return;
      }

      localEntry.totalScore = entry.totalScore;
      localEntry.roundScores = [...entry.roundScores];
    });
  },

  getLeaderboard: (): CPScoreEntry[] =>
    Object.values(ChorPoliceEngine.state.scores).sort(
      (a, b) => b.totalScore - a.totalScore,
    ),

  reset: (): void => {
    console.log("🧹 [CPEngine] Full state reset.");
    ChorPoliceEngine.state.players = [];
    ChorPoliceEngine.state.roles = [];
    ChorPoliceEngine.state.currentRound = 1;
    ChorPoliceEngine.state.totalRounds = 5;
    ChorPoliceEngine.state.scores = {};
    ChorPoliceEngine.state.stake = 0;
    ChorPoliceEngine.state.totalPot = 0;
    ChorPoliceEngine.state.policeIndex = -1;
    ChorPoliceEngine.state.kingIndex = -1;
    ChorPoliceEngine.state.thiefIndex = -1;
    ChorPoliceEngine.state.advisorIndex = -1;
    ChorPoliceEngine.state.isRoundActive = false;
  },
};

// 🖇️ SELF-REGISTRATION (OCP) — PacketRouter routes CP_* packets here automatically
PacketRouter.registerEngine(ChorPoliceEngine as IGameEngine);
