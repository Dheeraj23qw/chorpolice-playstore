// Divisibility rules with kid-friendly examples
const divisibilityHints: { [key: number]: string } = {
  2: "A number is divisible by 2 if its last digit is even (0, 2, 4, 6, 8).\n\n Example: 24 is divisible by 2 because the last digit is 4, which is even.",
  3: "A number is divisible by 3 if the sum of its digits is divisible by 3.\n\n Example: For 123, the sum of digits is 1 + 2 + 3 = 6, which is divisible by 3, so 123 is divisible by 3.",
  4: "A number is divisible by 4 if the last two digits form a number divisible by 4.\n\n Example: 132 ends with 32, and 32 ÷ 4 = 8, so 132 is divisible by 4.",
  5: "A number is divisible by 5 if its last digit is 0 or 5.\n\n Example: 65 ends with 5, so it is divisible by 5.",
  6: "A number is divisible by 6 if it is divisible by both 2 and 3.\n\n Example: 54 is divisible by 2 (last digit is 4, even) and by 3 (sum of digits is 5 + 4 = 9, divisible by 3), so 54 is divisible by 6.",
  7: `To check divisibility by 7, double the last digit, subtract it from the rest of the number, and repeat if needed.\n\n
Easy Example: For 21:\n
- Take the last digit (1), double it to get 2, and subtract from the rest of the number (2), giving 2 - 2 = 0.\n
- Since 0 is divisible by 7, 21 is divisible by 7!\n\n
Hard Example: For 1,001:\n
- Take the last digit (1), double it to get 2, and subtract from the rest of the number (100), giving 100 - 2 = 98.\n
- Repeat the process for 98: double the last digit (8) to get 16, subtract from 9 (the remaining part of 98), giving 9 - 16 = -7.\n
- Since -7 is divisible by 7, 1,001 is divisible by 7!`,
  8: "A number is divisible by 8 if the last three digits form a number divisible by 8.\n\n Example: For 1,248, the last three digits are 248, and 248 ÷ 8 = 31, so 1,248 is divisible by 8.",
  9: "A number is divisible by 9 if the sum of its digits is divisible by 9.\n\n Example: For 729, the sum of digits is 7 + 2 + 9 = 18, which is divisible by 9, so 729 is divisible by 9.",
};

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

  // Select a random divisor between 2 and 9
  const divisor = Math.floor(Math.random() * 8) + 2;

  // Determine divisibility
  const isDivisible = playerScore % divisor === 0;

  // Generate the question
  const question = `Is the score of ${selectedPlayer} in round ${
    roundIndex + 1
  } divisible by ${divisor}?`;

  // Provide the hint for the divisor with an additional explanation of divisibility
  const hint = `${divisibilityHints[divisor] || "No hint available for this divisor."}\n\n
 in Round ${roundIndex+1} ${selectedPlayer}'s score is ${playerScore} :\n
 ${playerScore} ÷ ${divisor} = ${(
    playerScore / divisor
  ).toFixed(1)}.\n
 Remainder: ${(playerScore /divisor).toFixed(1)}.\n
${playerScore} is ${
    isDivisible ? "" : "not "
  }divisible by ${divisor}.`;

  return {
    question,
    options: ["True", "False"], 
    correctAnswer: isDivisible ? "True" : "False",
    hint, 
  };
};
