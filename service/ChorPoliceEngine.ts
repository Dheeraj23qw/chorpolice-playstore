import { MODES, NETWORK } from "../constants/Networking";
import { PacketRouter } from "@/service/PacketRouter";
import { IGameEngine } from "./interfaces/IGameEngine";
import store from "@/redux/store";
import {
  setGamePhase,
  setMyRole as setReduxMyRole,
  setRoundActive,
  setRoundState,
  setStake,
  initMatchEconomy,
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
  engineName: "ChorPoliceEngine",
  state: {
    players: [] as CPPlayer[],
    roles: [] as Role[],          // roles[i] = role of players[i]
    currentRound: 1,
    totalRounds: 3,
    scores: {} as Record<string, CPScoreEntry>,
    stake: 0,
    totalPot: 0,
    policeIndex: -1,
    kingIndex: -1,
    thiefIndex: -1,
    advisorIndex: -1,
    isRoundActive: false,
    matchId: null as string | null,
    investigationTargets: [] as Array<{ id: string; type: "THIEF" | "ADVISOR" | "JOKER"; role: string; playerIndex: number | null }>,
    selectedTargetId: null as string | null,
  },

  /* ─── IGameEngine: canHandle ─── */
  canHandle: (type: string): boolean => {
    return type.startsWith("CP_");
  },

  /* ─── IGameEngine: processMultiplayer ─── */
  processMultiplayer: (packet: any, _sourceIp?: string): void => {
    const CP = MODES.CHOR_POLICE;

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
        if (packet.targetId) {
          console.log(`🎭 [CPEngine] 🎯 POLICE_GUESS received — ID: ${packet.targetId}`);
          ChorPoliceEngine.evaluateGuess(packet.targetId);
        } else if (packet.targetIndex !== undefined) {
          // Backward compatibility for index-based guesses
          const targets = ChorPoliceEngine.state.investigationTargets;
          const matchedTarget = targets.find(t => t.playerIndex === packet.targetIndex);
          console.log(`🎭 [CPEngine] 🎯 POLICE_GUESS received (Legacy Index: ${packet.targetIndex})`);
          if (matchedTarget) {
            ChorPoliceEngine.evaluateGuess(matchedTarget.id);
          } else {
            console.error(`🚨 [CPEngine] Guess failed: index ${packet.targetIndex} not found in current round targets.`);
          }
        }
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
        const isNewRound = (packet.round || 1) !== ChorPoliceEngine.state.currentRound;
        ChorPoliceEngine.state.currentRound =
          packet.round ?? ChorPoliceEngine.state.currentRound;
        ChorPoliceEngine.state.policeIndex =
          packet.policeIndex ?? ChorPoliceEngine.state.policeIndex;
        ChorPoliceEngine.state.kingIndex =
          packet.kingIndex ?? ChorPoliceEngine.state.kingIndex;
        ChorPoliceEngine.state.isRoundActive = true;

        let currentRoles = [...ChorPoliceEngine.state.roles];
        
        // 🛡️ STALE STATE PROTECTION:
        // If it's a new round, or if the current roles don't match the new public indices,
        // we must reset the client's role knowledge to "Hidden" for everything except
        // what is publicly revealed in this packet.
        const needsReset = isNewRound || currentRoles.length === 0 || 
          currentRoles[ChorPoliceEngine.state.kingIndex] !== "King" || 
          currentRoles[ChorPoliceEngine.state.policeIndex] !== "Police";

        if (needsReset) {
          // On the Host, ChorPoliceEngine.state.roles is already fully populated by startRound().
          // If we are the host, we don't want to "Hide" our own roles.
          // We check if the existing roles are actually a valid full set for this round.
          const isHostWithFullRoles = currentRoles.length === 4 && 
            currentRoles[ChorPoliceEngine.state.kingIndex] === "King" &&
            currentRoles[ChorPoliceEngine.state.policeIndex] === "Police" &&
            currentRoles.includes("Thief") && 
            currentRoles.includes("Advisor");

          if (!isHostWithFullRoles) {
            console.log(`🎭 [CPEngine] 🧹 Resetting stale roles for round ${ChorPoliceEngine.state.currentRound}`);
            
            // Get my current role from Redux to preserve it during reset
            const myRole = store.getState().session.myRole;
            const localId = store.getState().session.localPlayerId;
            const players = ChorPoliceEngine.state.players;
            const myIndex = players.findIndex(p => p.id === localId);

            currentRoles = new Array(4).fill("Hidden");
            
            // 🛡️ PRESERVE LOCAL PLAYER ROLE: if we already received ROLE_ASSIGN for this round
            if (myRole && myIndex !== -1) {
              currentRoles[myIndex] = myRole as Role;
            }

            if (packet.kingIndex !== undefined && packet.kingIndex !== null) {
              currentRoles[packet.kingIndex] = "King";
            }
            if (packet.policeIndex !== undefined && packet.policeIndex !== null) {
              currentRoles[packet.policeIndex] = "Police";
            }
            ChorPoliceEngine.state.roles = currentRoles;
          }
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
        {
          const localPlayerId = store.getState().session.localPlayerId;
          if (packet.playerId === localPlayerId) {
            dispatch(setReduxMyRole(packet.role));
            
            // 🚀 SYNC: If the roles array is already initialized (e.g. from previous round or current dealing)
            // update our own position in it so the UI shows our role immediately.
            if (ChorPoliceEngine.state.roles.length === 4) {
              const nextRoles = [...ChorPoliceEngine.state.roles];
              nextRoles[packet.playerIndex] = packet.role;
              ChorPoliceEngine.state.roles = nextRoles;
              
              // Sync Redux so UI reflects our role in the card list
              dispatch(setRoundState({
                round: ChorPoliceEngine.state.currentRound,
                roles: nextRoles,
                policeIndex: ChorPoliceEngine.state.policeIndex,
                kingIndex: ChorPoliceEngine.state.kingIndex,
                thiefIndex: ChorPoliceEngine.state.thiefIndex,
                advisorIndex: ChorPoliceEngine.state.advisorIndex,
              }));
            }
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

      case NETWORK.SYNC_STATE:
        console.log(`🎭 [CPEngine] 🔄 Received SYNC_STATE from host`);
        ChorPoliceEngine.handleSyncState(packet);
        break;

      default: {
        if (packet.type === "RECONNECT_STATUS") {
          console.log(`🎭 [CPEngine] 📡 Reconnect status update: ${packet.playerId} -> ${packet.status}`);
          dispatch({ 
            type: "session/setPlayerConnectionStatus", 
            payload: { playerId: packet.playerId, status: packet.status } 
          });
          break;
        }
        // UI-only packets handled by hooks/UI — silently ignore
        const UI_ONLY_PACKETS = [
          CP.SCORE_QUIZ_TURN,
          CP.SCORE_GUESS,
          CP.SCORE_GUESS_RESULT,
          CP.POLICE_TURN_READY,
        ];
        if (UI_ONLY_PACKETS.includes(packet.type)) break;
        console.log(`🎭 [CPEngine] ⚠️ Unhandled CP packet type: ${packet.type}`);
        break;
      }
    }
  },

  /* ─── Handle full state sync from Host ─── */
  handleSyncState: (packet: any): void => {
    const { 
      players, currentRound, totalRounds, roles, 
      policeIndex, kingIndex, thiefIndex, advisorIndex, 
      isRoundActive, stake, scores, gamePhase, myRole 
    } = packet;

    ChorPoliceEngine.state.players = players || ChorPoliceEngine.state.players;
    ChorPoliceEngine.state.currentRound = currentRound || ChorPoliceEngine.state.currentRound;
    ChorPoliceEngine.state.totalRounds = totalRounds || ChorPoliceEngine.state.totalRounds;
    ChorPoliceEngine.state.roles = roles || ChorPoliceEngine.state.roles;
    ChorPoliceEngine.state.policeIndex = policeIndex ?? ChorPoliceEngine.state.policeIndex;
    ChorPoliceEngine.state.kingIndex = kingIndex ?? ChorPoliceEngine.state.kingIndex;
    ChorPoliceEngine.state.thiefIndex = thiefIndex ?? ChorPoliceEngine.state.thiefIndex;
    ChorPoliceEngine.state.advisorIndex = advisorIndex ?? ChorPoliceEngine.state.advisorIndex;
    ChorPoliceEngine.state.isRoundActive = !!isRoundActive;
    ChorPoliceEngine.state.stake = stake ?? ChorPoliceEngine.state.stake;
    
    // Restore investigation targets if provided
    if (packet.investigationTargets) {
      ChorPoliceEngine.state.investigationTargets = packet.investigationTargets;
    }
    if (packet.selectedTargetId !== undefined) {
      ChorPoliceEngine.state.selectedTargetId = packet.selectedTargetId;
    }

    if (scores) {
      ChorPoliceEngine.state.scores = scores;
    }

    // Derive myRole from the synced roles array
    const localId = store.getState().session.localPlayerId;
    const myIndex = ChorPoliceEngine.state.players.findIndex(p => p.id === localId);
    const derivedMyRole = myIndex !== -1 ? ChorPoliceEngine.state.roles[myIndex] : null;

    // Update Redux
    dispatch(setStake(ChorPoliceEngine.state.stake));
    dispatch(setReduxMyRole(derivedMyRole));
    dispatch(setRoundActive(ChorPoliceEngine.state.isRoundActive));
    dispatch(setRoundState({
      round: ChorPoliceEngine.state.currentRound,
      totalRounds: ChorPoliceEngine.state.totalRounds,
      roles: ChorPoliceEngine.state.roles,
      policeIndex: ChorPoliceEngine.state.policeIndex,
      kingIndex: ChorPoliceEngine.state.kingIndex,
      thiefIndex: ChorPoliceEngine.state.thiefIndex,
      advisorIndex: ChorPoliceEngine.state.advisorIndex,
    }));
    dispatch(setGamePhase(gamePhase));
    if (ChorPoliceEngine.state.matchId) {
      dispatch(initMatchEconomy({ 
        matchId: ChorPoliceEngine.state.matchId, 
        stakeAmount: ChorPoliceEngine.state.stake 
      }));
    }
  },

  /* ─── Replace a human player with a bot ─── */
  replacePlayerWithBot: (playerId: string): void => {
    const player = ChorPoliceEngine.state.players.find(p => p.id === playerId);
    if (!player || player.isBot) return;

    console.log(`🎭 [CPEngine] 🤖 Replacing player ${player.name} (${playerId}) with a BOT`);
    player.isBot = true;
    player.name = `${player.name} (Bot)`;

    // Update Scores entry
    const scoreEntry = ChorPoliceEngine.state.scores[playerId];
    if (scoreEntry) {
      scoreEntry.name = player.name;
    }

    // Notify bot behavior via network/dispatcher (Decoupled)
    PacketRouter.broadcast({
      type: "NETWORK_BOT_REPLACED",
      playerId,
      player,
    });

    // Sync Redux
    dispatch({ 
      type: "session/setPlayerConnectionStatus", 
      payload: { playerId, status: "BOT_REPLACED" } 
    });
  },

  /* ─── Initialize a new session ─── */
  init: (players: CPPlayer[], stake: number, totalRounds: number = 3): void => {
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
    
    const matchId = `CP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    ChorPoliceEngine.state.matchId = matchId;
    dispatch(initMatchEconomy({ matchId, stakeAmount: stake }));


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
    if (__DEV__) {
      console.log(`[CP_START] startRound called. Round: ${ChorPoliceEngine.state.currentRound}`);
    }
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
    console.log(`🎭 [CPEngine] 🚀 startRound() EXECUTING for Round ${currentRound}/${totalRounds}`);
    console.log(`🎭 [CPEngine]   Players in engine: ${players.length}`);
    players.forEach((p, i) => console.log(`🎭 [CPEngine]     P${i}: ${p.name} (ID: ${p.id}, Bot: ${!!p.isBot})`));

    // FIX BUG-8: was a deterministic LCG — same seed = same roles every game.
    // Host is authoritative and broadcasts the result, so Math.random() is correct.
    const ROLES: Role[] = ["King", "Police", "Thief", "Advisor"];
    let shuffled: Role[] = [...ROLES];
    console.log(`🎭 [CPEngine]   Initial Roles: [${shuffled.join(", ")}]`);
    
    // Custom logic: 50% chance for human to be Police if 1 human, 3 bots
    const humanIndices = players.reduce<number[]>((acc, p, i) => (!p.isBot ? [...acc, i] : acc), []);
    if (humanIndices.length === 1 && Math.random() < 0.50) {
      const humanIndex = humanIndices[0];
      shuffled = ["King", "Thief", "Advisor"];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      shuffled.splice(humanIndex, 0, "Police");
      console.log(`🎭 [CPEngine] 🎲 Custom rule applied: Human granted Police role (50% chance hit)`);
    } else {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }

    try {
      console.log("[CP_START] startRound: before role shuffle");
      ChorPoliceEngine.state.roles = shuffled;
      ChorPoliceEngine.state.policeIndex = shuffled.indexOf("Police");
      ChorPoliceEngine.state.kingIndex = shuffled.indexOf("King");
      ChorPoliceEngine.state.thiefIndex = shuffled.indexOf("Thief");
      ChorPoliceEngine.state.advisorIndex = shuffled.indexOf("Advisor");

      console.log("[CP_START] startRound: roles created", shuffled);

      // 🛡️ INDEX VALIDATION
      if (ChorPoliceEngine.state.policeIndex === -1 || ChorPoliceEngine.state.kingIndex === -1) {
        throw new Error(`Critical roles missing: King=${ChorPoliceEngine.state.kingIndex}, Police=${ChorPoliceEngine.state.policeIndex}`);
      }

      ChorPoliceEngine.state.isRoundActive = true;
      ChorPoliceEngine.state.selectedTargetId = null;

      console.log("[CP_START] startRound: before player loop (generating targets)");
      // 🎭 Joker Integration: Generate the 3 investigation mystery cards
      const targets = ChorPoliceEngine.generateInvestigationTargets();
      ChorPoliceEngine.state.investigationTargets = targets;
      console.log("[CP_START] startRound: after player loop");
    } catch (error) {
      console.error("[CP_START] startRound crashed during initialization", error);
      return;
    }



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

    console.log("[CP_START] startRound: before PUBLIC_REVEAL");
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
      investigationTargets: ChorPoliceEngine.state.investigationTargets.map(t => ({
        id: t.id,
        type: t.type,
        playerIndex: t.playerIndex,
        role: t.role,
      })),
    });
    console.log("[CP_START] startRound: PUBLIC_REVEAL emitted");
  },

  /* ─── Evaluate the Police player's guess ─── */
  evaluateGuess: (targetId: string): void => {
    if (!ChorPoliceEngine.state.isRoundActive) {
      console.log("🛡️ [CPEngine] Ignoring duplicate guess — round not active.");
      return;
    }

    const { investigationTargets, roles, players, currentRound, scores, policeIndex, kingIndex } = ChorPoliceEngine.state;
    
    // Find target in investigationTargets (could be Thief, Advisor, or Joker)
    const target = investigationTargets.find(t => t.id === targetId);

    if (!target) {
      console.error(`🚨 [CPEngine] Guess failed: targetId ${targetId} not found in current investigationTargets!`);
      return;
    }

    // 🛡️ REVEALED CARD GUARD: Although Joker targets are typically only mystery cards,
    // we verify that the playerIndex (if any) isn't the King or Police.
    if (target.playerIndex !== null && (target.playerIndex === policeIndex || target.playerIndex === kingIndex)) {
      console.warn(`🛡️ [CPEngine] Ignoring guess on revealed role: ${target.role}`);
      return;
    }

    ChorPoliceEngine.state.isRoundActive = false;
    ChorPoliceEngine.state.selectedTargetId = targetId;
    dispatch(setRoundActive(false));

    const correct = target.role === "Thief";
    const guessedRole = target.role;

    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);
    console.log(`🎭 [CPEngine] POLICE GUESS EVALUATION (ID: ${targetId})`);
    console.log(`🎭 [CPEngine]   Target Role  : ${guessedRole}`);
    console.log(`🎭 [CPEngine]   Correct      : ${correct ? "✅ YES (caught thief!)" : "❌ NO (thief escaped)"}`);
    console.log(`🎭 [CPEngine]   Round        : ${currentRound}`);
    console.log(`🎭 [CPEngine] ═══════════════════════════════════`);

    // Scoring logic:
    // If Correct: King 1000, Advisor 800, Police 500, Thief 0
    // If Wrong (Advisor or Joker): King 1000, Advisor 800, Police 0, Thief 500
    const pointMap: Record<Role, number> = correct
      ? { King: 1000, Advisor: 800, Police: 500, Thief: 0 }
      : { King: 1000, Advisor: 800, Police: 0, Thief: 500 };

    // Apply scores
    players.forEach((player, index) => {
      const role = roles[index];
      const points = pointMap[role as Role] || 0;
      if (scores[player.id]) {
        scores[player.id].totalScore += points;
        scores[player.id].roundScores.push(points);
        console.log(`🎭 [CPEngine]   ${player.name} (${role}): +${points} → total: ${scores[player.id].totalScore}`);
      }
    });

    // Broadcast result to all players
    const CP = MODES.CHOR_POLICE;
    const leaderboard = ChorPoliceEngine.getLeaderboard();
    const targetIndex = investigationTargets.findIndex(t => t.id === targetId);

    PacketRouter.broadcast({
      type: CP.ROUND_RESULT,
      correct,
      guessedTargetId: targetId,
      guessedTargetIndex: targetIndex,
      guessedPlayerIndex: target?.playerIndex ?? null,
      guessedRole,
      round: currentRound,
      allRoles: players.map((p, i) => ({
        playerIndex: i,
        playerId: p.id,
        playerName: p.name,
        role: roles[i],
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

  generateInvestigationTargets: () => {
    const { thiefIndex, advisorIndex } = ChorPoliceEngine.state;
    const targets: Array<{ id: string; type: "THIEF" | "ADVISOR" | "JOKER"; role: string; playerIndex: number | null }> = [
      { id: "target_thief", role: "Thief", type: "THIEF", playerIndex: thiefIndex },
      { id: "target_advisor", role: "Advisor", type: "ADVISOR", playerIndex: advisorIndex },
      { id: "target_joker", role: "Joker", type: "JOKER", playerIndex: null },
    ];
    // Shuffle the 3 targets so Thief isn't always at the same relative spot
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    return targets;
  },

  reset: (): void => {
    console.log("🧹 [CPEngine] Full state reset.");
    ChorPoliceEngine.state.players = [];
    ChorPoliceEngine.state.roles = [];
    ChorPoliceEngine.state.currentRound = 1;
    ChorPoliceEngine.state.totalRounds = 3;
    ChorPoliceEngine.state.scores = {};
    ChorPoliceEngine.state.stake = 0;
    ChorPoliceEngine.state.totalPot = 0;
    ChorPoliceEngine.state.policeIndex = -1;
    ChorPoliceEngine.state.kingIndex = -1;
    ChorPoliceEngine.state.thiefIndex = -1;
    ChorPoliceEngine.state.advisorIndex = -1;
    ChorPoliceEngine.state.isRoundActive = false;
    ChorPoliceEngine.state.investigationTargets = [];
    ChorPoliceEngine.state.selectedTargetId = null;
  },
};

// 🖇️ SELF-REGISTRATION (OCP) — PacketRouter routes CP_* packets here automatically
PacketRouter.registerEngine(ChorPoliceEngine as IGameEngine);
