import { CPMultiplayerContext } from "./types";
import { MODES } from "@/constants/Networking";
import { broadcastPacket } from "@/service/lanGameService";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import store from "@/redux/store";

import { toast } from "@/components/feedback/toast";

export const handleGameEndExit = (packet: any, context: CPMultiplayerContext) => {
  const { refs, logic } = context;
  const _localPlayerId = refs.localPlayerIdRef.current;
  const s = store.getState().session;
  
  const isLeaver = _localPlayerId === packet.leaverId;
  const refund = !isLeaver && s.economy.stakeDebited && s.economy.settlementStatus === "PENDING"
    ? s.economy.stakeAmount
    : 0;

  if (refund > 0) {
    logic.economy.handleRefund(refund, packet.reason === "host_quit" ? "Host left." : "A player left.");
  } else if (!isLeaver) {
    // 🔥 FEEDBACK: Ensure all non-faulty players know why the match ended
    const msg = packet.reason === "host_quit" ? "The host has left the game." : "A player has left. Match ended for fairness.";
    toast.error("Match Ended", msg, 4000);
  }
  
  logic.cleanup.navigateToHome();
};

export const handlePlayerLeave = (packet: any, context: CPMultiplayerContext) => {
  const { refs, logic } = context;
  const CP = MODES.CHOR_POLICE;
  const _localPlayerId = refs.localPlayerIdRef.current;
  const _isHost = refs.isHostRef.current;

  if (packet.playerId !== _localPlayerId && refs.gamePhaseRef.current !== "final_result") {
    if (_isHost) {
      broadcastPacket({
        type: CP.GAME_END,
        reason: "player_left",
        leaverId: packet.playerId,
        stake: ChorPoliceEngine.state.stake,
        networkIssue: packet.reason === "heartbeat_timeout",
      });
    } else if (packet.playerId === "host_id" || packet.reason === "host_disconnected") {
      const s = store.getState().session;
      const refund = s.economy.stakeDebited && s.economy.settlementStatus === "PENDING"
        ? s.economy.stakeAmount
        : 0;

      if (refund > 0) {
        logic.economy.handleRefund(refund, "The host disconnected.");
      }
      logic.cleanup.navigateToHome();
    }
  }
};
