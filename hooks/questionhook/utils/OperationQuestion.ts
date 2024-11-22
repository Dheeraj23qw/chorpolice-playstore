export const generateOperationQuestion = (
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

  // Randomly select two different players
  let player1 = players[Math.floor(Math.random() * players.length)];
  let player2 = players[Math.floor(Math.random() * players.length)];

  // Ensure that player1 is different from player2
  while (player1 === player2) {
    player2 = players[Math.floor(Math.random() * players.length)];
  }

  // Randomly select a round between 0-9
  const roundIndex = Math.floor(Math.random() * 10);

  // Fetch scores for the selected players from the provided function
  const score1 = getSpecificRoundScore(roundIndex, player1);
  const score2 = getSpecificRoundScore(roundIndex, player2);

  // If either score is NaN or undefined, throw an error
  if (isNaN(score1) || isNaN(score2)) {
    throw new Error(`Invalid score returned for players: ${player1}, ${player2}`);
  }

  // Randomly select an operation (+, -, *)
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  // Initialize correctAnswer and question variables
  let correctAnswer = 0;
  let question = "";

  // Calculate correctAnswer based on selected operation
  switch (operation) {
    case "+":
      question = `What is the sum of ${player1}'s and ${player2}'s scores in round ${roundIndex + 1}?`;
      correctAnswer = score1 + score2;
      break;
    case "-":
      question = `What is the absolute difference between ${player1}'s and ${player2}'s scores in round ${roundIndex + 1}?`;
      correctAnswer = Math.abs(score1 - score2); // Ensure positive result
      break;
    case "*":
      question = `What is the result of multiplying ${player1}'s and ${player2}'s scores in round ${roundIndex + 1}?`;
      correctAnswer = score1 * score2;
      break;
    default:
      throw new Error(`Invalid operation: ${operation}`);
  }

  // Generate 3 incorrect answers with some variation
  const wrongAnswers = generateWrongAnswers(correctAnswer);

  // Shuffle the answers and ensure all are positive
  const allOptions = [correctAnswer, ...wrongAnswers].map(option => Math.abs(option)); // Ensure all answers are positive
  const shuffledOptions = shuffleArray(allOptions);

  return {
    question,
    correctAnswer: correctAnswer.toString(),
    options: shuffledOptions.map(String),
  };
};

// Function to generate incorrect answers with variation
const generateWrongAnswers = (correctAnswer: number): number[] => {
  return [
    correctAnswer + Math.floor(Math.random() * 5) + 2,  // Incorrect answer 1 (positive)
    correctAnswer - Math.floor(Math.random() * 5) - 2,  // Incorrect answer 2 (positive)
    correctAnswer * Math.floor(Math.random() * 2) + 2,  // Incorrect answer 3 (positive)
  ];
};

// Function to shuffle array elements randomly
const shuffleArray = (array: any[]): any[] => {
  return array.sort(() => Math.random() - 0.5);
};
