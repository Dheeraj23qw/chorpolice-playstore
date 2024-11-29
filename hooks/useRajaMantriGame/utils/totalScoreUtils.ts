import { Dispatch } from "redux";
import { updatePlayerScores, updateScoresByRound } from "@/redux/reducers/playerReducer";

interface PlayerScore {
  playerName: string;
  scores: number[];
  totalScore?: number;
}

export const calculateTotalScores = (
  playerScores: PlayerScore[],
  dispatch: Dispatch
) => {
 
  const updatedScores = playerScores.map((player) => {
    const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
    return {
      ...player,
      totalScore,
    };
  });

  const totalScoresArray = updatedScores.map((player) => ({
    playerName: player.playerName,
    totalScore: player.totalScore!,
  }));

  
    dispatch(updateScoresByRound(playerScores))
    dispatch(updatePlayerScores(totalScoresArray));

  return updatedScores;
};
