export const generateDivisibilityQuestion = (
  getSpecificRoundScore: (
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

  // Select a random player and round
  const roundIndex = Math.floor(Math.random() * 10); // Assuming 10 rounds
  const selectedPlayer = players[Math.floor(Math.random() * players.length)];

  // Get the player's score for the selected round
  const playerScore = getSpecificRoundScore(roundIndex, selectedPlayer);

  // Select a random divisor between 2 and 10
  const divisor = Math.floor(Math.random() * 9) + 2;

  // Determine divisibility
  const isDivisible = playerScore % divisor === 0;

  // Generate the question and answers
  const question = `Is the score of ${selectedPlayer} in round ${
    roundIndex + 1
  } divisible by ${divisor}?`;

  return {
    question,
    options: ["True", "False"], // Fixed options for a boolean question
    correctAnswer: isDivisible ? "True" : "False",
  };
};
