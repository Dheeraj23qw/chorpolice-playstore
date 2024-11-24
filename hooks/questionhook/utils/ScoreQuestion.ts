export const generateScoreQuestion = (
  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ) => number
) => {
  // Define possible players
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  let roundIndex: number;
  let targetScore = 0; // Initialize with a default value
  let selectedPlayer: "Police" | "Thief" | "King" | "Advisor" = "Police"; // Default initialization
  let scoresAreUnique: boolean;

  do {
    roundIndex = 4 + Math.floor(Math.random() * 6); // 4 + (0 to 5)
    // Get scores for all players at the selected round
    const scores = players.map((player) => ({
      player,
      score: getTotalScoreUpToRound(roundIndex, player),
    }));

    // Check for unique scores
    const scoreValues = scores.map(({ score }) => score);
    const uniqueScores = new Set(scoreValues);
    scoresAreUnique = uniqueScores.size === players.length;

    if (scoresAreUnique) {
      // Randomly select a player and their score
      const randomPlayerIndex = Math.floor(Math.random() * players.length);
      selectedPlayer = players[randomPlayerIndex];
      targetScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);
    }
  } while (!scoresAreUnique); // Regenerate round if scores are not unique

  // Shuffle the player options for multiple-choice answers
  const shuffledPlayers = players.sort(() => Math.random() - 0.5);

  // Calculate the total score at the end of the round for all players
  const totalScores = players
    .map((player) => ({
      player,
      score: getTotalScoreUpToRound(roundIndex, player),
    }))
    .reduce((acc, { player, score }) => {
      acc[player] = score;
      return acc;
    }, {} as Record<string, number>);

  // Construct the hint
  const totalScoresAtRoundEnd = Object.entries(totalScores)
    .map(([player, score]) => `${player}: ${score}`)
    .join(",\n ");

  const hint = `At the end of round ${
    roundIndex + 1
  },\n\n the scores are as follows: \n\n${totalScoresAtRoundEnd}.\n\n The player with the score of ${targetScore} is ${
    selectedPlayer
  }.\n\n Therefore, ${selectedPlayer} is the correct answer.`;

  // Return the question, options, correct answer, and hint
  return {
    question: `Which player has a score of ${targetScore} at the end of round ${
      roundIndex + 1
    }?`,
    options: shuffledPlayers, // Multiple-choice options
    correctAnswer: selectedPlayer, // The correct answer
    hint, // Explanation of the correct answer
    boolean: false

  };
};
