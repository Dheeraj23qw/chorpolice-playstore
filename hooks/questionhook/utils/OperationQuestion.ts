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
    throw new Error(
      `Invalid score returned for players: ${player1}, ${player2}`
    );
  }

  // Randomly select an operation (+, -, *)
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  // Initialize correctAnswer and question variables
  let correctAnswer = 0;
  let question = "";
  let hint = "";

  const PLAYERS_SCORES_DATA = `${player1}'s score in round ${
    roundIndex + 1
  } is ${score1}\n\n ${player2}'s score in round ${
    roundIndex + 1
  } is ${score2}\n\n `;

  // Calculate correctAnswer based on selected operation
  switch (operation) {
    case "+":
      question = `What is the sum of ${player1}'s and ${player2}'s scores in round ${
        roundIndex + 1
      }?`;
      correctAnswer = score1 + score2;

      hint =
        `${PLAYERS_SCORES_DATA}` +
        `The sum is: ${score1} + ${score2} = ${correctAnswer}.`;
      break;

    case "-":
      question = `What is the absolute difference between ${player1}'s and ${player2}'s scores in round ${
        roundIndex + 1
      }?`;
      correctAnswer = Math.abs(score1 - score2); // Ensure positive result

      // Add simple hint with separate scores
      hint =
        `${PLAYERS_SCORES_DATA}` +
        `The absolute difference is: |${score1} - ${score2}| = ${correctAnswer}.`;
      break;

    case "*":
      question = `What is the result of multiplying ${player1}'s and ${player2}'s scores in round ${
        roundIndex + 1
      }?`;
      correctAnswer = score1 * score2;

      // Add simple hint with separate scores
      hint =
        `${PLAYERS_SCORES_DATA}` +
        `The product is: ${score1} * ${score2} = ${correctAnswer}.`;
      break;

    default:
      throw new Error(`Invalid operation: ${operation}`);
  }

  const optionsSet = new Set<number>();

  // Add correct answer first
  optionsSet.add(correctAnswer);

  while (optionsSet.size < 4) {
    // Generate a new option using the buffer
    const randomOption = Math.abs(
      correctAnswer + Math.floor(Math.random() * 6) - 3
    );
    optionsSet.add(randomOption); // Add it to the set
  }

  // Convert the Set to an array and shuffle it
  const options = Array.from(optionsSet)
    .map((option) => Math.abs(option).toString()) // Convert to string and ensure all are positive
    .sort(() => Math.random() - 0.5);

  return {
    question,
    correctAnswer: correctAnswer.toString(),
    options,
    hint,
  };
};
