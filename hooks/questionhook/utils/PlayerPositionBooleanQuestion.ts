export const generatePlayerPositionBooleanQuestion = (
  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ) => number
) => {
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  const roundIndex = Math.floor(Math.random() * 10); // Select a random round (0-9)
  const rank = Math.floor(Math.random() * 4) + 1; // Random rank (1-4)

  // Map player scores up to the selected round
  const playerScores = players.map((player) => ({
    player,
    totalScore: getTotalScoreUpToRound(roundIndex, player),
  }));

  // Sort players by total score in descending order
  playerScores.sort((a, b) => b.totalScore - a.totalScore);

  const rankWord = ["first", "second", "third", "fourth"][rank - 1];
  const playerAtRank = playerScores[rank - 1]; // Player at the selected rank
  const isPlayerAtRank = Math.random() < 0.5; // Randomly decide truth value

  const question = isPlayerAtRank
    ? `Is ${playerAtRank.player} at ${rankWord} position after round ${roundIndex + 1}?`
    : `Is someone else at ${rankWord} position after round ${roundIndex + 1}?`;

  return {
    question,
    options: ["True", "False"], // Boolean answer options
    correctAnswer: isPlayerAtRank ? "True" : "False",
  };
};
