export const generateRandomPositionQuestion = (
  roundIndex: number,

  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor",
  ) => number,
) => {
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  const rank = Math.floor(Math.random() * 4) + 1; // Random rank (1 to 4)
  const rankWord = ["first", "second", "third", "fourth"][rank - 1];

  let currentRound = roundIndex;
  let finalPlayerScores = players.map((player) => ({
    player,
    totalScore: getTotalScoreUpToRound(currentRound, player),
  }));

  // LOOP until we find a round with unique scores to make it "EASY"
  let attempts = 0;
  while (attempts < 10) {
    const uniqueScores = new Set(finalPlayerScores.map(s => s.totalScore));
    if (uniqueScores.size === players.length) {
      break;
    }
    currentRound = Math.floor(Math.random() * (roundIndex + 1));
    finalPlayerScores = players.map((player) => ({
      player,
      totalScore: getTotalScoreUpToRound(currentRound, player),
    }));
    attempts++;
  }

  // Sort players by score (descending)
  finalPlayerScores.sort((a, b) => b.totalScore - a.totalScore);

  // Get the player at the specified rank
  const playerAtRank = finalPlayerScores[rank - 1];

  // If no player is found (edge case), return an empty question
  if (!playerAtRank) {
    return {
      question: `No player is ranked ${rankWord} at the end of round ${roundIndex + 1}.`,
      options: [],
      correctAnswer: "",
      hint: "No valid ranking data available.",
    };
  }

  // Randomize the order of players for the answer options
  const shuffledPlayers = finalPlayerScores
    .map((entry: any) => entry.player)
    .sort(() => Math.random() - 0.5);

  // Generate the hint with player scores and rankings
  const hint = finalPlayerScores
    .map(
      (entry, index) =>
        `${index + 1}. ${entry.player}: ${entry.totalScore} points`,
    )
    .join("\n");

  // Return the question, options, correct answer, and hint
  return {
    question: `Who was at ${rankWord} position at the end of round ${currentRound + 1}?`,
    options: shuffledPlayers,
    correctAnswer: playerAtRank.player,
    hint: `Scores and Rankings at the end of Round ${currentRound + 1}:\n${hint}`,
    boolean: false,
  };
};
