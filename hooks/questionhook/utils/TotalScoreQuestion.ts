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

  const roundIndex = Math.floor(Math.random() * 3) + 7;
  const selectedPlayer = players[Math.floor(Math.random() * players.length)];

  const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

  const hint = `To find the correct answer, you need to add up all the points ${selectedPlayer} has collected Up to Round ${roundIndex+1}\n
  the total score of the ${selectedPlayer} at the end of round ${roundIndex + 1} is ${totalScore}`;

  const optionsSet = new Set<number>();

  // Add the correct answer first
  optionsSet.add(totalScore);

  // Generate unique options
  while (optionsSet.size < 4) {
    const buffer = Math.floor(Math.random() * 3) + 1; // Random adjustment
    const option = totalScore + Math.floor(Math.random() * 7) - 3; // Create a random offset
    optionsSet.add(option); // Only adds unique values
  }

  // Convert the set to an array and shuffle
  const options = Array.from(optionsSet)
    .map((option) => Math.abs(option).toString()) // Convert to string and ensure all are positive
    .sort(() => Math.random() - 0.5);

  return {
    question: `What is the total score of the ${selectedPlayer} at the end of round ${
      roundIndex + 1
    }?`,
    options,
    correctAnswer: totalScore.toString(),
    hint
  };
};
