export const generateTotalScoreQuestion = (
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

  // Get the total score for the selected player at the chosen round
  const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

  // Generate randomized answer options
  const options = [
    totalScore.toString(), // Correct answer
    (totalScore + Math.floor(Math.random() * 10) + 1).toString(), // Slightly higher wrong answer
    (totalScore - Math.floor(Math.random() * 10) - 1).toString(), // Slightly lower wrong answer
    (totalScore + Math.floor(Math.random() * 20) + 1).toString(), // Larger deviation wrong answer
  ].sort(() => Math.random() - 0.5); // Shuffle the options

  return {
    question: `What is the total score of the ${selectedPlayer} at round ${
      roundIndex + 1
    }?`,
    options,
    correctAnswer: totalScore.toString(),
  };
};
