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

  const roundIndex = Math.floor(Math.random() * (7 - 3 + 1)) + 3; // Random round index between 3 and 7
  const rank = Math.floor(Math.random() * 4) + 1; // Random rank (1 to 4)

  const rankWord = ["first", "second", "third", "fourth"][rank - 1];

  // Get total scores for each player up to the selected round
  const playerScores = players.map((player) => ({
    player,
    totalScore: getTotalScoreUpToRound(roundIndex, player),
  }));

  // Tie-breaking rule: King > Advisor > Police > Thief
  const rolePriority: Record<"Police" | "Thief" | "King" | "Advisor", number> = {
    King: 1,
    Advisor: 2,
    Police: 3,
    Thief: 4,
  };

  // Sort players by score (descending), then by role priority (ascending)
  playerScores.sort((a, b) => {
    if (b.totalScore === a.totalScore) {
      return rolePriority[a.player] - rolePriority[b.player];
    }
    return b.totalScore - a.totalScore;
  });

  // Get the player at the specified rank
  const playerAtRank = playerScores[rank - 1];

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
  const shuffledPlayers = playerScores
    .map((entry) => entry.player)
    .sort(() => Math.random() - 0.5);

  // Generate the hint with player scores and rankings
  const hint = playerScores
    .map(
      (entry, index) =>
        `${index + 1}. ${entry.player}: ${entry.totalScore} points`
    )
    .join("\n");

  // Return the question, options, correct answer, and hint
  return {
    question: `Who was at ${rankWord} position at the end of round ${roundIndex + 1}?(In case of a tie, King > Advisor > Police > Thief)`,
    options: shuffledPlayers,
    correctAnswer: playerAtRank.player,
    hint: `Scores and Rankings at the end of Round ${roundIndex+1}:\n${hint}`,
  };
};
