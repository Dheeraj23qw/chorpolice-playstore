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

  // Select two unique players
  const player1 =
    players[Math.floor(Math.random() * players.length)];
  const remainingPlayers = players.filter((player) => player !== player1);
  const player2 =
    remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];

  // Randomly select a round
  const roundIndex = Math.floor(Math.random() * 10);

  // Fetch scores for the selected players
  const score1 = getSpecificRoundScore(roundIndex, player1);
  const score2 = getSpecificRoundScore(roundIndex, player2);

  // Randomly select an operation
  const operations: ("+" | "-" | "*")[] = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let question = "";
  let correctAnswer = 0;

  switch (operation) {
    case "+":
      question = `What is the sum of ${player1}'s and ${player2}'s scores at round ${
        roundIndex + 1
      }?`;
      correctAnswer = score1 + score2;
      break;
    case "-":
      question = `What is the result of subtracting ${
        Math.min(score1, score2)
      } from ${Math.max(score1, score2)} at round ${roundIndex + 1}?`;
      correctAnswer = Math.abs(score1 - score2);
      break;
    case "*":
      question = `What is the result of multiplying ${player1}'s and ${player2}'s scores at round ${
        roundIndex + 1
      }?`;
      correctAnswer = score1 * score2;
      break;
  }

  // Generate wrong answers
  const wrongAnswers = Array.from(
    new Set([
      correctAnswer + Math.floor(Math.random() * 10 + 1),
      correctAnswer - Math.floor(Math.random() * 10 + 1),
      correctAnswer + Math.floor(Math.random() * 20 + 1),
    ])
  ).slice(0, 3);

  // Combine correct and wrong answers and shuffle them
  const allAnswers = [correctAnswer, ...wrongAnswers]
    .filter((val) => val >= 0) // Ensure all answers are valid
    .sort(() => Math.random() - 0.5);

  return {
    question,
    options: allAnswers.map(String), // Answers as strings
    correctAnswer: correctAnswer.toString(),
  };
};
