import { CPMultiplayerContext } from "./types";
import { updatePlayerScores as updateReduxScores } from "@/redux/reducers/playerReducer";
import store from "@/redux/store";
import { cleanupAfterMatchCompleted, markMatchSettledLocally } from "@/service/lanGameService";

export const handleGameEndCompleted = (packet: any, context: CPMultiplayerContext) => {
  const { refs, dispatch, logic, setQuizDone } = context;
  const _isHost = refs.isHostRef.current;

  refs.scoreQuizStartedRef.current = false;
  refs.roundStartPendingRef.current = false;
  refs.currentQuizPlayerIdRef.current = null;
  setQuizDone(true);

  const leaderboard = packet.leaderboard ?? [];
  dispatch(
    updateReduxScores(
      leaderboard.map((e: any) => ({
        playerId: e.id,
        playerName: e.name,
        totalScore: e.totalScore,
      }))
    )
  );

  logic.playTransition("final_result");

  // Handle settlement BEFORE cleanup (coins still need economy state)
  if (store.getState().session.economy.settlementStatus === "PENDING") {
    logic.economy.handleSettlement(leaderboard, packet.totalPot ?? 0);
    const matchId = packet.matchId || store.getState().session.economy.matchId;
    if (matchId) {
      markMatchSettledLocally(matchId);
    }
  }

  // 🔥 POST-MATCH SOCKET CLEANUP
  // Host: Small delay to ensure final result packet is flushed to all clients
  // Client: Clean up immediately since result is already stored in Redux
  const cleanupDelay = _isHost ? 500 : 100;
  setTimeout(() => {
    cleanupAfterMatchCompleted({ reason: "completed", preserveResult: true });
  }, cleanupDelay);
};
