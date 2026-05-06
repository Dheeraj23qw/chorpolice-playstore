import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { 
  markStakeDebited, 
  setSettlementStatus 
} from "@/redux/reducers/sessionSlice";
import { updateCoins } from "@/features/wallet/walletSlice";
import { toast } from "@/components/feedback/toast";
import { recordCPGame } from "@/features/gameStats/gameStatsActions";

interface EconomyDeps {
  localPlayerId: string;
  reduxStake: number;
}

export const useCPEconomy = ({
  localPlayerId,
  reduxStake,
}: EconomyDeps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleStakeDebit = useCallback((economy: any) => {
    if (!economy.matchId || economy.stakeDebited || economy.stakeAmount <= 0) {
      return;
    }
    console.log(`💰 [ECONOMY] Debiting stake for match: ${economy.matchId}`);
    dispatch(markStakeDebited());
    dispatch(updateCoins(-economy.stakeAmount));
    toast.info("Match Started", `Stake of ${economy.stakeAmount} coins debited.`);
  }, [dispatch]);

  const handleSettlement = useCallback((leaderboard: any[], totalPot: number) => {
    dispatch(setSettlementStatus("SETTLED"));
    
    if (leaderboard.length > 0) {
      const maxScore = leaderboard[0].totalScore;
      const winners = leaderboard.filter((p: any) => p.totalScore === maxScore);
      const isLocalWinner = winners.some((p: any) => p.id === localPlayerId);
      
      if (isLocalWinner) {
        const splitPot = Math.floor(totalPot / winners.length);
        if (splitPot > 0) {
          dispatch(updateCoins(splitPot));
          const winMsg = winners.length > 1 
            ? `You tied for 1st! Shared pot: ${splitPot} coins.`
            : `You won the full pot of ${splitPot} coins!`;
          toast.success("CHAMPION! 🏆", winMsg);
        }
      }
    }
    recordCPGame(dispatch, leaderboard[0]?.id === localPlayerId, "completed");
  }, [dispatch, localPlayerId]);

  const handleRefund = useCallback((refundAmount: number, reason: string) => {
    if (refundAmount > 0) {
      dispatch(setSettlementStatus("REFUNDED"));
      dispatch(updateCoins(refundAmount));
      toast.success("Refunded (Fairness)", reason, 5000);
    }
  }, [dispatch]);

  return {
    handleStakeDebit,
    handleSettlement,
    handleRefund,
  };
};
