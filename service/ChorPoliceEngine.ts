import { MODES } from "../constants/Networking";
import { PacketRouter } from "./PacketRouter";
import { IGameEngine } from "./interfaces/IGameEngine";
import store from "@/redux/store";
import {
  setGamePhase,
  setMyRole,
  setRoundActive,
  setRoundState,
  setStake,
} from "@/redux/reducers/sessionSlice";

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
 * ARCHITECTURE:
 * - Engine.state is a WRITE-THROUGH CACHE for fast game logic computations.
 * - Every mutation ALSO dispatches to Redux (sessionSlice) so the UI
 *   reads from Redux as the single source of truth.
 * - The engine never reads from Redux — it only writes to it.
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

// ── Redux dispatch helper (fail-safe) ──
const dispatch = (action: any) => {
  try {
    store.dispatch(action);
  } catch (e) {
    if (__DEV__) {
      console.warn("[CPEngine] Redux dispatch failed:", e);
    }
  }
};

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
        // PROD-4 FIX: if players are already initialised (host called init() directly),
        // skip re-init; just ensure phase is set correctly.
        if (ChorPoliceEngine.state.players.length > 0) {
          console.log(`🎭 [CPEngine] 🟢 GAME_START — engine already initialised, skipping re-init.`);
          dispatch(setGamePhase("waiting"));
          break;
        }
        console.log(`🎭 [CPEngine] 🟢 GAME_START received — session ready. Waiting for host to click Play.`);
        dispatch(setGamePhase("waiting"));
        break;

      case CP.POLICE_GUESS:
        console.log(`🎭 [CPEngine] 🎯 POLICE_GUESS received — target index: ${packet.targetIndex}`);
        ChorPoliceEngine.evaluateGuess(packet.targetIndex);
        break;

      case CP.ROUND_START:
        console.log(`🎭 [CPEngine] ▶️ ROUND_START received — starting round ${ChorPoliceEngine.state.currentRound}`);
        if (ChorPoliceEngine.state.isRoundActive) {
          console.warn(
            "🛡️ [CPEngine] Duplicate ROUND_START ignored — round already active.",
          );
          break;
        }
        ChorPoliceEngine.startRound();
        break;

      case CP.PUBLIC_REVEAL: {
        ChorPoliceEngine.state.currentRound =
          packet.round ?? ChorPoliceEngine.state.currentRound;
        ChorPoliceEngine.state.policeIndex =
          packet.policeIndex ?? ChorPoliceEngine.state.policeIndex;
        ChorPoliceEngine.state.kingIndex =
          packet.kingIndex ?? ChorPoliceEngine.state.kingIndex;
        ChorPoliceEngine.state.isRoundActive = true;

        let currentRoles = [...ChorPoliceEngine.state.roles];
        if (currentRoles.length === 0) {
          currentRoles = new Array(4).fill("Hidden");
          if (packet.kingIndex !== undefined && packet.kingIndex !== null) {
            currentRoles[packet.kingIndex] = "King";
          }
          if (packet.policeIndex !== undefined && packet.policeIndex !== null) {
            currentRoles[packet.policeIndex] = "Police";
          }
          ChorPoliceEngine.state.roles = currentRoles;
        }

        // ── Redux sync ──
        dispatch(setRoundActive(true));
        dispatch(setRoundState({
          round: ChorPoliceEngine.state.currentRound,
          roles: currentRoles,
          policeIndex: ChorPoliceEngine.state.policeIndex,
          kingIndex: ChorPoliceEngine.state.kingIndex,
          thiefIndex: ChorPoliceEngine.state.thiefIndex,
          advisorIndex: ChorPoliceEngine.state.advisorIndex,
        }));
        dispatch(setGamePhase("dealing"));
        break;
      }

      case CP.ROLE_ASSIGN:
        // Each player receives their own role via this packet.
        // Dispatch to Redux so the UI can read myRole from the store.
        {
          const sessionState = store.getState().session;
          if (packet.playerId === sessionState.localPlayerId) {
            dispatch(setMyRole(packet.role));
          }
        }
        break;

      case CP.ROUND_RESULT:
        ChorPoliceEngine.state.isRoundActive = false;
        ChorPoliceEngine.state.currentRound =
          (packet.round ?? ChorPoliceEngine.state.currentRound) + 1;
        ChorPoliceEngine.state.roles =
          packet.allRoles?.map((entry: any) => entry.role) ??
          ChorPoliceEngine.state.roles;
        ChorPoliceEngine.syncScores(packet.leaderboard);

        // ── Redux sync ──
        dispatch(setRoundActive(false));
        dispatch(setRoundState({
          round: ChorPoliceEngine.state.currentRound,
          roles: [...ChorPoliceEngine.state.roles],
          policeIndex: packet.allRoles?.findIndex((e: any) => e.role === "Police") ?? null,
          kingIndex: packet.allRoles?.findIndex((e: any) => e.role === "King") ?? null,
          thiefIndex: packet.allRoles?.findIndex((e: any) => e.role === "Thief") ?? null,
          advisorIndex: packet.allRoles?.findIndex((e: any) => e.role === "Advisor") ?? null,
        }));
        dispatch(setGamePhase("result"));
        break;

      case CP.SCORE_GUESS_RESULT:
        ChorPoliceEngine.syncScores(packet.leaderboard);
        break;

      case CP.GAME_END:
        console.log(`🎭 [CPEngine] 🛑 GAME_END received — reason: ${packet.reason}`);
        if (packet.reason === "completed") {
          const currentPhase = store.getState().session.gamePhase;
          if (currentPhase !== "video_transition") {
            dispatch(setGamePhase("final_result"));
          }
        }
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

    // ── Redux sync ──
    dispatch(setStake(stake));
    dispatch(setRoundState({
      round: 1,
      totalRounds,
      roles: [],
      policeIndex: null,
      kingIndex: null,
      thiefIndex: null,
      advisorIndex: null,
    }));
    dispatch(setGamePhase("waiting"));
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

    // FIX BUG-8: was a deterministic LCG — same seed = same roles every game.
    // Host is authoritative and broadcasts the result, so Math.random() is correct.
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

    // ── Redux sync ──
    dispatch(setRoundActive(true));
    dispatch(setRoundState({
      round: currentRound,
      roles: [...shuffled],
      policeIndex: ChorPoliceEngine.state.policeIndex,
      kingIndex: ChorPoliceEngine.state.kingIndex,
      thiefIndex: ChorPoliceEngine.state.thiefIndex,
      advisorIndex: ChorPoliceEngine.state.advisorIndex,
    }));

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
    dispatch(setRoundActive(false));

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
