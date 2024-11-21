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

  // Randomly select a round (0 to 9) and a player
  const roundIndex = Math.floor(Math.random() * 10); // Assuming 10 rounds (0-9)
  const selectedPlayer =
    players[Math.floor(Math.random() * players.length)];

  // Get the total score for the selected player up to the chosen round
  const targetScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

  // Shuffle the player options for multiple-choice answers
  const shuffledPlayers = players.sort(() => Math.random() - 0.5);

  return {
    question: `Which player has a score of ${targetScore} at round ${
      roundIndex + 1
    }?`,
    options: shuffledPlayers, // Multiple-choice options
    correctAnswer: selectedPlayer, // The correct answer is the selected player
  };
};
