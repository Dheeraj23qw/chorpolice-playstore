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
        ChorPoliceEngine.startRound();
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

    console.log(`🎭 [CPEngine] Initializing session — ${players.length} players, stake: ${stake}, rounds: ${totalRounds}`);

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

    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);
    console.log(`🎭 [CPEngine] Starting Round ${currentRound}/${totalRounds}`);
    console.log(`🎭 [CPEngine] Players: [${players.map(p => `${p.name}(${p.id}${p.isBot ? ",bot" : ""})`).join(", ")}]`);

    // Fisher-Yates shuffle
    const shuffled: Role[] = [...ROLES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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

    // Advance round counter
    ChorPoliceEngine.state.currentRound++;
  },

  /* ─── End game ─── */
  endGame: (): void => {
    console.log("🏁 [CPEngine] Game Over!");

    const leaderboard = Object.values(ChorPoliceEngine.state.scores)
      .sort((a, b) => b.totalScore - a.totalScore);

    PacketRouter.broadcast({
      type: MODES.CHOR_POLICE.GAME_END,
      reason: "completed",
      leaderboard,
      totalPot: ChorPoliceEngine.state.totalPot,
    });
  },

  /* ─── Full state reset ─── */
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
