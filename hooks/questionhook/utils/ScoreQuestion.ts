export const generateScoreQuestion = (
  initialRoundIndex: number,
  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor",
  ) => number,
  maxRounds: number, // Added this to keep random picks within table bounds
) => {
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  let targetScore = 0;
  let selectedPlayer: "Police" | "Thief" | "King" | "Advisor" = "Police";
  let scoresAreUnique: boolean;
  let currentRound = initialRoundIndex;

  do {
    // REMOVED: roundIndex = 4 + Math.floor(Math.random() * 6);
    // This was the bug causing it to jump to row 7 or 9.

    // Get scores for all players at the current round
    const scores = players.map((player) => ({
      player,
      score: getTotalScoreUpToRound(currentRound, player),
    }));

    // Check if all players have different scores (to avoid multiple correct answers)
    const scoreValues = scores.map(({ score }) => score);
    const uniqueScores = new Set(scoreValues);
    scoresAreUnique = uniqueScores.size === players.length;

    if (scoresAreUnique) {
      // Randomly select one of the players to be the "target"
      const randomPlayerIndex = Math.floor(Math.random() * players.length);
      selectedPlayer = players[randomPlayerIndex];
      targetScore = scores[randomPlayerIndex].score;
    } else {
      // If scores are not unique, pick a NEW round index
      // that is guaranteed to be within your table's range
      currentRound = Math.floor(Math.random() * maxRounds);
    }
  } while (!scoresAreUnique);

  // Shuffle the player options for multiple-choice answers
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  // Calculate the total scores for the hint display
  const totalScores = players.reduce(
    (acc, player) => {
      acc[player] = getTotalScoreUpToRound(currentRound, player);
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalScoresAtRoundEnd = Object.entries(totalScores)
    .map(([player, score]) => `${player}: ${score}`)
    .join(",\n ");

  const hint = `At the end of round ${currentRound + 1},\n\nthe scores are as follows:\n\n${totalScoresAtRoundEnd}.\n\nThe player with the score of ${targetScore} is ${selectedPlayer}.\n\nTherefore, ${selectedPlayer} is the correct answer.`;

  return {
    question: `Which player has a score of ${targetScore} at the end of round ${currentRound + 1}?`,
    options: shuffledPlayers,
    correctAnswer: selectedPlayer,
    hint,
    boolean: false,
  };
};
