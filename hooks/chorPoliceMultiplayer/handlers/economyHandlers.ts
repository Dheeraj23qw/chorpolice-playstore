import { CPMultiplayerContext } from "./types";
import { updatePlayerScores as updateReduxScores } from "@/redux/reducers/playerReducer";
import store from "@/redux/store";

export const handleGameEndCompleted = (packet: any, context: CPMultiplayerContext) => {
  const { refs, dispatch, logic, setQuizDone } = context;

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
  
  // 🔥 STOP NETWORKING: Result is in Redux, no need for active heartbeat/transport.
  // This prevents the "empty screen" bug if players leave while host is viewing results.
  import("@/service/lanGameService").then(m => m.stopSession());

  if (store.getState().session.economy.settlementStatus === "PENDING") {
    logic.economy.handleSettlement(leaderboard, packet.totalPot ?? 0);
  }
};
