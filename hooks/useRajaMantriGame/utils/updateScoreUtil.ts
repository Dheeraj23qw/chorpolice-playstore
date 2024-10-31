// updateScoreUtils.ts
interface PlayerScore {
    playerName: string;
    scores: number[];
  }
  
  /**
   * Updates the score for a specific player and round.
   * @param prevScores - The previous scores array.
   * @param playerIndex - The index of the player whose score needs updating.
   * @param newScore - The new score to add for the specified round.
   * @param roundIndex - The round index for which the score should be updated.
   * @returns A new array with the updated player scores.
   */
  export const updateScoreUtil = (
    prevScores: PlayerScore[],
    playerIndex: number,
    newScore: number,
    roundIndex: number
  ): PlayerScore[] => {
    if (playerIndex < 0 || playerIndex >= prevScores.length) return prevScores;
  
    return prevScores.map((player, index) => {
      if (index === playerIndex) {
        const updatedScores = [...player.scores];
        updatedScores[roundIndex] = newScore;
        return { ...player, scores: updatedScores };
      }
      return player;
    });
  };
  