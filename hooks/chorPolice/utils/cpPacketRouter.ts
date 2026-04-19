/**
 * @file cpPacketRouter.ts
 * @module Networking/ChorPolice
 * @description Advanced packet-to-action router for LAN multiplayer.
 * This file serves as the 'Central Intelligence' that translates raw network
 * packets into synchronized game state updates and UI animations.
 */

import { MODES } from "@/constants/Networking";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";

/**
 * Interface: GameStateActions
 * Describes the state-management API required by the router.
 */
interface GameStateActions {
  setMyRole: (role: string | null) => void;
  // Bulk update method to prevent multiple re-renders
  setAll: (data: any) => void;
  setPlayerScores: (scores: any) => void;
  setUiFlags: (flags: any) => void;
  setGamePhase: (phase: string) => void;
  // Logic-heavy update methods
  updateScores: (packet: any) => void;
  playTransition: (phase: string) => void;
  prepareNextRound: () => void;
}

interface PacketRouterProps {
  gameState: GameStateActions;
  animation: any;
  quiz: { prepareQuiz: () => void };
  engine: { handleGameEnd: (packet: any) => void };
  localPlayerId: string;
  dispatch: any;
  setReduxPlayerNames: (payload: any) => any;
}

/**
 * Factory: createPacketRouter
 * WHAT: Generates a memoized listener for the LAN service.
 * HOW: Maps incoming 'CP_' prefixed packets to specific domain-driven actions.
 */
export const createPacketRouter = ({
  gameState,
  animation,
  quiz,
  engine,
  localPlayerId,
  dispatch,
  setReduxPlayerNames,
}: PacketRouterProps) => {
  const CP = MODES.CHOR_POLICE;

  return (packet: any) => {
    /**
     * ── 1. ROLE ASSIGNMENT ──────────────────────────────────────────────────
     * WHAT: Sets the private identity of the local user.
     * WHY: This is the first packet sent. It allows the local UI to render
     * specific views (e.g., 'You are the Police') before the board is public.
     */
    if (packet.type === CP.ROLE_ASSIGN && packet.playerId === localPlayerId) {
      gameState.setMyRole(packet.role);
    }

    /**
     * ── 2. PUBLIC REVEAL (The Global Sync) ──────────────────────────────────
     * WHAT: Synchronizes every player's device with the Host's Engine state.
     * HOW: Uses setAll to update names, indices, and round info in one batch.
     * WHY: Prevents 'desync' where one player thinks it's Round 2 while another thinks it's Round 3.
     */
    if (packet.type === CP.PUBLIC_REVEAL) {
      const names = packet.players.map((p: any) => p.name);

      // Update Global Redux State: Used by shared components like 'OverlayPopUp'
      dispatch(
        setReduxPlayerNames(
          names.map((n: string, i: number) => ({ id: i, name: n })),
        ),
      );

      // Atomic Update: Syncing local UI indices with the Core Engine logic
      gameState.setAll({
        playerNames: names,
        roles: [...ChorPoliceEngine.state.roles],
        policeIndex: packet.policeIndex,
        kingIndex: packet.kingIndex,
        advisorIndex: ChorPoliceEngine.state.advisorIndex,
        thiefIndex: ChorPoliceEngine.state.thiefIndex,
        totalRounds: ChorPoliceEngine.state.totalRounds,
        round: packet.round,
      });

      // Initialization: Wipe and prepare scores for a new game session
      if (packet.round === 1) {
        gameState.setPlayerScores(
          names.map((n: string) => ({ playerName: n, scores: [] })),
        );
      }

      // Safety: Disable game triggers while the dealing animation is running
      gameState.setUiFlags({ isPlayButtonDisabled: true });
      animation.runDealingSequence(packet, gameState);
    }

    /**
     * ── 3. ROUND RESULT (Decision & Points) ────────────────────────────────
     * WHAT: Processes the outcome of the 'Police' player's guess.
     * HOW: Updates scores and triggers the reveal animation sequence.
     * WHY: This is the emotional climax of each round. The logic branch
     * determines whether we move to the next round or end the game loop.
     */
    if (packet.type === CP.ROUND_RESULT) {
      gameState.setGamePhase("result");

      // Domain Logic: Adds points to the respective players based on role correctness
      gameState.updateScores(packet);

      // Start the 8s sequence to flip over the 'Chor' and 'Police' cards
      animation.runRevealSequence(packet, gameState, () => {
        if (packet.isLastRound) {
          // Final Round -> Setup Quiz for the tie-breaker/bonus points
          quiz.prepareQuiz();
          gameState.playTransition("score_quiz");
        } else {
          // Mid Game -> Reset UI state for a fresh round layout
          gameState.prepareNextRound();
        }
      });
    }

    /**
     * ── 4. GAME END (Final Conclusion) ──────────────────────────────────────
     * WHAT: Finalizes the session and calculates winnings.
     * HOW: Delegates to the engine bridge to handle wallet updates and stats.
     * WHY: Keeps the router light while ensuring the wallet and UI are updated.
     */
    if (packet.type === CP.GAME_END) {
      engine.handleGameEnd(packet);
    }
  };
};
