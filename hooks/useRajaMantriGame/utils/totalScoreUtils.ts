import { Dispatch } from "redux";
import { updatePlayerScores } from "@/redux/slices/playerSlice";

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

  // Dispatch the array to the store after a short delay
  setTimeout(() => {
    dispatch(updatePlayerScores(totalScoresArray));
  }, 1000);

  return updatedScores;
};
