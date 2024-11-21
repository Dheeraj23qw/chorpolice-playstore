export const generateRandomPositionQuestion = (
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

  const roundIndex = Math.floor(Math.random() * 5); // Select a random round (0 to 4)
  const rank = Math.floor(Math.random() * 4) + 1; // Random rank (1 to 4)

  // Map rank number to rank word (1 -> "first", 2 -> "second", etc.)
  const rankWord = ["first", "second", "third", "fourth"][rank - 1];

  // Get total scores for each player up to the selected round
  const playerScores = players.map((player) => ({
    player,
    totalScore: getTotalScoreUpToRound(roundIndex, player),
  }));

  // Sort players by total score in descending order
  playerScores.sort((a, b) => b.totalScore - a.totalScore);

  // Get the player at the specified rank
  const playerAtRank = playerScores[rank - 1];

  // If no player is found (edge case), return an empty question
  if (!playerAtRank) {
    return {
      question: `No player is ranked ${rankWord} at the end of round ${roundIndex + 1}.`,
      options: [],
      correctAnswer: "",
    };
  }

  // Randomize the order of players for the answer options
  const shuffledPlayers = playerScores
    .map((entry) => entry.player)
    .sort(() => Math.random() - 0.5);

  // Return the question, options, and the correct answer
  return {
    question: `Who was at ${rankWord} position after round ${roundIndex + 1}?`,
    options: shuffledPlayers,
    correctAnswer: playerAtRank.player,
  };
};
