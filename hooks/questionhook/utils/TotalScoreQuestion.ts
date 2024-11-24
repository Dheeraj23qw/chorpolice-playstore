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

  const buffer = Math.floor(Math.random() * 3) + 1; 

  // Use Math.abs() to ensure all values are positive
  const options = [
    Math.abs(totalScore + buffer).toString(),
    Math.abs(totalScore + buffer - 1).toString(),
    Math.abs(totalScore - buffer).toString(),
    Math.abs(totalScore).toString(),
  ].sort(() => Math.random() - 0.5); // Shuffle the options

  return {
    question: `What is the total score of the ${selectedPlayer} at the end of round ${
      roundIndex + 1
    }?`,
    options,
    correctAnswer: totalScore.toString(),
    hint
  };
};
