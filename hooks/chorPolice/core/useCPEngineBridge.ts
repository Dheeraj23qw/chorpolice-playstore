/**
 * @file cpPacketRouter.ts
 * @module ChorPolice/Networking
 * @description Central logic hub for processing LAN multiplayer packets.
 */

import { MODES } from "@/constants/Networking";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { setPlayerNames as setReduxPlayerNames } from "@/redux/reducers/playerReducer";
import { updateCoins } from "@/features/wallet/walletSlice";
import { toast } from "@/components/feedback/toast";
import { recordCPGame } from "@/features/gameStats/gameStatsActions";
import { AppDispatch } from "@/redux/store";
import { Router } from "expo-router";

// Define strict interfaces to keep the router type-safe
interface GameStateActions {
  setMyRole: (role: any) => void;
  setPlayerNames: (names: string[]) => void;
  setRoles: (roles: string[]) => void;
  setIndices: (indices: {
    police: number;
    king: number;
    advisor: number;
    thief: number;
  }) => void;
  setTotalRounds: (total: number) => void;
  setRound: (round: any) => void;
  setPlayerScores: (update: any) => void;
  setGamePhase: (phase: string) => void;
  setUi: (update: (prev: any) => any) => void;
  playTransition: (nextPhase: string) => void;
  state: { roles: string[]; myRole: string | null }; // Added for animation logic access
}

interface AnimationActions {
  runDealingSequence: (packet: any, gameState: any) => void;
  runRevealSequence: (
    packet: any,
    gameState: any,
    callback: () => void,
  ) => void;
  hardResetAnimations: () => void;
}

interface PacketRouterProps {
  gameState: GameStateActions;
  animation: AnimationActions;
  quiz: { prepareQuiz: () => void };
  localPlayerId: string;
  isHost: boolean; // Pass isHost directly for cleaner logic
  dispatch: AppDispatch;
  router: Router;
}

export const createPacketRouter = ({
  gameState,
  animation,
  quiz,
  localPlayerId,
  isHost,
  dispatch,
  router,
}: PacketRouterProps) => {
  const CP = MODES.CHOR_POLICE;

  return (packet: any) => {
    // --- 1. IDENTITY ---
    if (packet.type === CP.ROLE_ASSIGN && packet.playerId === localPlayerId) {
      gameState.setMyRole(packet.role);
    }

    // --- 2. PUBLIC REVEAL (ROUND START) ---
    if (packet.type === CP.PUBLIC_REVEAL) {
      const names = packet.players.map((p: any) => p.name);
      const engineRoles = [...ChorPoliceEngine.state.roles];

      dispatch(
        setReduxPlayerNames(
          names.map((n: string, i: number) => ({ id: i, name: n })),
        ),
      );

      gameState.setPlayerNames(names);
      gameState.setRoles(engineRoles);
      gameState.setIndices({
        police: packet.policeIndex,
        king: packet.kingIndex,
        advisor: ChorPoliceEngine.state.advisorIndex,
        thief: ChorPoliceEngine.state.thiefIndex,
      });
      gameState.setTotalRounds(ChorPoliceEngine.state.totalRounds);
      gameState.setRound(packet.round);

      if (packet.round === 1) {
        gameState.setPlayerScores(
          names.map((n: string) => ({ playerName: n, scores: [] })),
        );
      }

      gameState.setUi((prev) => ({ ...prev, isPlayButtonDisabled: true }));
      animation.runDealingSequence(packet, gameState);
    }

    // --- 3. ROUND RESULT ---
    if (packet.type === CP.ROUND_RESULT) {
      gameState.setGamePhase("result");
      gameState.setUi((prev) => ({ ...prev, areCardsClickable: false }));

      gameState.setPlayerScores((prev: any[]) => {
        return prev.map((p) => {
          const info = packet.allRoles?.find(
            (r: any) => r.playerName === p.playerName,
          );
          if (!info) return p;

          const pts: Record<string, number> = packet.correct
            ? { King: 1000, Advisor: 800, Police: 500, Thief: 0 }
            : { King: 1000, Advisor: 800, Police: 0, Thief: 500 };

          return { ...p, scores: [...p.scores, pts[info.role] || 0] };
        });
      });

      // Execute Reveal -> onComplete logic
      animation.runRevealSequence(packet, gameState, () => {
        if (packet.isLastRound) {
          quiz.prepareQuiz();
          gameState.playTransition("score_quiz");
        } else {
          animation.hardResetAnimations();
          gameState.setUi((prev) => ({
            ...prev,
            areCardsClickable: false,
            firstCardClicked: false,
            popupIndex: null,
            showTableButton: false,
          }));
          gameState.setMyRole(null);
          gameState.setGamePhase("round_video");
        }
      });
    }

    // --- 4. GAME END ---
    if (packet.type === CP.GAME_END && packet.reason === "completed") {
      gameState.playTransition("final_result");
      const isWinner = packet.leaderboard?.[0]?.id === localPlayerId;
      const totalPot = packet.totalPot ?? 0;

      if (isWinner && totalPot > 0) {
        dispatch(updateCoins(totalPot));
        toast.success("CHAMPION! 🏆", `You won ${totalPot} coins!`);
      }
      recordCPGame(dispatch, isWinner, "completed");
    }

    // --- 5. NETWORK SAFETY ---
    if (
      packet.type === CP.GAME_END &&
      packet.reason === "host_quit" &&
      !isHost
    ) {
      const refund = packet.stake || 0;
      if (refund > 0) {
        dispatch(updateCoins(refund));
        toast.success("Refunded!", `${refund} coins returned.`);
      }
      router.dismissAll();
      router.replace("/mode-select");
    }
  };
};
