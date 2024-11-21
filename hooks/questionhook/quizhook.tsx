import { useState, useEffect } from "react";

export const useGameTableAndScores = (
  difficulty: "easy" | "medium" | "hard"
) => {
  const [table, setTable] = useState<(number | string)[][]>([
    ["Round", "Police", "Thief", "King", "Advisor"],
  ]);
  const [totalScores, setTotalScores] = useState<Record<string, number>>({
    Police: 0,
    Thief: 0,
    King: 0,
    Advisor: 0,
  });

  const generateRandomNumber = (difficulty: "easy" | "medium" | "hard") => {
    if (difficulty === "easy") return Math.floor(Math.random() * 10) + 1;
    if (difficulty === "medium") return Math.floor(Math.random() * 90) + 10;
    return Math.floor(Math.random() * 900) + 100;
  };

  useEffect(() => {
    const header = ["Round", "Police", "Thief", "King", "Advisor"];
    const rows = Array.from({ length: 10 }, (_, roundIndex) => {
      const roundScores = {
        Police: generateRandomNumber(difficulty),
        Thief: generateRandomNumber(difficulty),
        King: generateRandomNumber(difficulty),
        Advisor: generateRandomNumber(difficulty),
      };
      return [
        roundIndex + 1,
        roundScores.Police,
        roundScores.Thief,
        roundScores.King,
        roundScores.Advisor,
      ];
    });

    setTable([header, ...rows]);

    const totals = rows.reduce(
      (acc, row) => {
        acc.Police += row[1] as number;
        acc.Thief += row[2] as number;
        acc.King += row[3] as number;
        acc.Advisor += row[4] as number;
        return acc;
      },
      { Police: 0, Thief: 0, King: 0, Advisor: 0 }
    );

    setTotalScores(totals);
  }, [difficulty]);

  const getSpecificRoundScore = (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ): number => {
    const playerColumnMap = { Police: 1, Thief: 2, King: 3, Advisor: 4 };
    const columnIndex = playerColumnMap[player];
    if (table.length <= roundIndex + 1 || !table[roundIndex + 1]) {
      return 0;
    }
    const roundRow = table[roundIndex + 1];
    return (roundRow[columnIndex] as number) || 0;
  };

  const getTotalScoreUpToRound = (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ): number => {
    const playerColumnMap = { Police: 1, Thief: 2, King: 3, Advisor: 4 };
    const columnIndex = playerColumnMap[player];

    if (roundIndex >= table.length - 1) {
      roundIndex = table.length - 2; // Adjust to the last valid round if out of bounds
    }

    let total = 0;
    for (let i = 1; i <= roundIndex + 1; i++) {
      const roundRow = table[i];
      total += roundRow[columnIndex] as number;
    }

    return total;
  };

  const getCalculationSteps = (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor",
    operation: "+" | "-" | "*"
  ): string => {
    const playerColumnMap = { Police: 1, Thief: 2, King: 3, Advisor: 4 };
    const columnIndex = playerColumnMap[player];

    if (roundIndex >= table.length - 1) {
      roundIndex = table.length - 2; // Adjust to the last valid round if out of bounds
    }

    const steps: string[] = [];
    let total = 0;

    // Start the calculation with the first number in Round 1
    if (table[1]) {
      total = table[1][columnIndex] as number;
      steps.push(`Start with ${total}`);
    }

    for (let i = 2; i <= roundIndex + 1; i++) {
      const roundRow = table[i];
      const value = roundRow[columnIndex] as number;

      if (operation === "+") {
        total += value;
        steps.push(`${total - value} + ${value} = ${total}`);
      } else if (operation === "-") {
        total -= value;
        steps.push(`${total + value} - ${value} = ${total}`);
      } else if (operation === "*") {
        total *= value;
        steps.push(`${total / value} * ${value} = ${total}`);
      }
    }

    return steps.join("\n");
  };

  const generateScoreQuestion = () => {
    // Randomly choose a round and a player
    const roundIndex = Math.floor(Math.random() * 10); // Pick a round (0-8)
    const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
      "Police",
      "Thief",
      "King",
      "Advisor",
    ];

    const selectedPlayer = players[Math.floor(Math.random() * players.length)];

    // Get the total score for the selected player at the chosen round
    const targetScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

    // Shuffle the options for multiple-choice
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

    return {
      question: `Which player has a score of ${targetScore} at  round ${
        roundIndex + 1
      }?`,
      options: shuffledPlayers,
      correctAnswer: selectedPlayer, // The correct answer is the selected player
    };
  };

  // New function to generate a question asking for the total score of a player at a round
  const generateTotalScoreQuestion = () => {
    const roundIndex = Math.floor(Math.random() * 10); // Pick a round (0-9)
    const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
      "Police",
      "Thief",
      "King",
      "Advisor",
    ];

    const selectedPlayer = players[Math.floor(Math.random() * players.length)];

    // Get the total score for that player up to the selected round
    const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

    return {
      question: `What is the total score of the ${selectedPlayer} at round ${
        roundIndex + 1
      }?`,
      options: [
        totalScore.toString(), // Correct answer is the total score
        (totalScore + Math.floor(Math.random() * 10)).toString(), // Random wrong answer
        (totalScore - Math.floor(Math.random() * 10)).toString(), // Random wrong answer
        (totalScore + Math.floor(Math.random() * 20)).toString(), // Random wrong answer
      ].sort(() => Math.random() - 0.5), // Shuffle the answers
      correctAnswer: totalScore.toString(),
    };
  };

  // Function to generate question based on random operation between two players' round scores
  const generateOperationQuestion = () => {
    const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
      "Police",
      "Thief",
      "King",
      "Advisor",
    ];

    // Randomly pick two players and a round
    const player1 = players[Math.floor(Math.random() * players.length)];
    const player2 = players[Math.floor(Math.random() * players.length)];
    const roundIndex = Math.floor(Math.random() * 10); // Pick a round (0-9)

    // Fetch their scores from the selected round
    const score1 = getSpecificRoundScore(roundIndex, player1);
    const score2 = getSpecificRoundScore(roundIndex, player2);

    // Randomly pick an operation: sum, subtraction, or multiplication
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
        // Ensure the subtraction is done by subtracting the smaller number from the larger number
        const biggerScore = Math.max(score1, score2);
        const smallerScore = Math.min(score1, score2);
        question = `What is the result of subtracting ${smallerScore} from ${biggerScore} at round ${
          roundIndex + 1
        }?`;
        correctAnswer = biggerScore - smallerScore;
        break;
      case "*":
        question = `What is the result of multiplying ${player1}'s and ${player2}'s scores at round ${
          roundIndex + 1
        }?`;
        correctAnswer = score1 * score2;
        break;
    }

    // Generate some random wrong answers (within a reasonable range)
    // Generate some random wrong answers (within a reasonable range), ensuring they are positive
    const wrongAnswers = [
      Math.abs(correctAnswer + Math.floor(Math.random() * 10)), // Ensure positive answer
      Math.abs(correctAnswer - Math.floor(Math.random() * 10)), // Ensure positive answer
      Math.abs(correctAnswer + Math.floor(Math.random() * 20)), // Ensure positive answer
    ];

    // Shuffle the answers to randomize their positions
    const allAnswers = [correctAnswer, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    return {
      question,
      options: allAnswers.map(String), // Convert all answers to string for options
      correctAnswer: correctAnswer.toString(), // Correct answer as string
    };
  };

  const generateTrueFalseQuestion = () => {
    const roundIndex = Math.floor(Math.random() * 10); // Pick a random round (0-9)
    const players: ("Police" | "Thief" | "King" | "Advisor")[] = ["Police", "Thief", "King", "Advisor"];
    
    const selectedPlayer = players[Math.floor(Math.random() * players.length)];
  
    // Get the total score for the selected player up to the selected round
    const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);
  
    // Calculate the total sum of scores for the selected round
    const totalSum = players.reduce((sum, player) => sum + getTotalScoreUpToRound(roundIndex, player), 0);
  
    // Define a helper function to check if a number is prime
    const isPrime = (num: number) => {
      if (num <= 1) return false;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
      }
      return true;
    };
  
    // Choose a random question type from 3 available options (even/odd, prime, sum comparison)
    const questionType = Math.floor(Math.random() * 4); // Randomly select one of the 3 question types
  
    let question = "";
    let isTrue = false;
  
    switch (questionType) {
      case 0: {
        // Even or Odd check for the selected player's score in the current round
        question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} an even number?`;
        isTrue = totalScore % 2 === 0; // Check if the score is even
        break;
      }
      case 1: {
        // Prime number check for the selected player's score in the current round
        question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} a prime number?`;
        isTrue = isPrime(totalScore); // Check if the score is prime
        break;
      }
      case 2: {
        // Total sum comparison between the selected player's score and the sum of all players' scores for the same round
        question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} greater than the total sum of scores for all players in that round?`;
        isTrue = totalScore > totalSum; // Check if the selected player's score is greater than the sum of all players' scores
        break;
      }
      case 3: {
        question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} an Odd number?`;
        isTrue = totalScore % 2 != 0; // Check if the score is even
        break;
      }
      default:
        break;
    }
  
    return {
      question,
      options: ["True", "False"],
      correctAnswer: isTrue ? "True" : "False", // Correct answer based on the condition
    };
  };
  
  const generateRoundOffQuestion = (
    difficulty: "easy" | "medium" | "hard"
  ) => {
    // Generate a random score based on difficulty
    let score = 0;
    if (difficulty === "easy") {
      score = Math.floor(Math.random() * 90) + 10; // Random score between 10-99
    } else if (difficulty === "medium") {
      score = Math.floor(Math.random() * 900) + 100; // Random score between 100-999
    } else {
      score = Math.floor(Math.random() * 9000) + 1000; // Random score between 1000-9999
    }
  
    // Calculate the rounded-off score
    let roundedScore = 0;
    let roundingStep = 0;
    let roundOffDescription = "";
  
    if (difficulty === "easy") {
      roundedScore = Math.round(score / 10) * 10; // Round to nearest 10
      roundingStep = 10;
      roundOffDescription = `Round off ${score} to the nearest 10.`;
    } else if (difficulty === "medium") {
      roundedScore = Math.round(score / 100) * 100; // Round to nearest 100
      roundingStep = 100;
      roundOffDescription = `Round off ${score} to the nearest 100.`;
    } else {
      roundedScore = Math.round(score / 1000) * 1000; // Round to nearest 1000
      roundingStep = 1000;
      roundOffDescription = `Round off ${score} to the nearest 1000.`;
    }
  
   
    const options = [
      roundedScore.toString(), // Correct answer
      (roundedScore + Math.floor(Math.random() * 50)).toString(), // Random wrong answer 1
      (roundedScore - Math.floor(Math.random() * 50)).toString(), // Random wrong answer 2
      (roundedScore + Math.floor(Math.random() * 100)).toString(), // Random wrong answer 3
    ].sort(() => Math.random() - 0.5); // Shuffle options
  
    return {
      question: `${roundOffDescription} What is the rounded-off score?`,
      options,
      correctAnswer: roundedScore.toString(),
    };
  };

  

  return {
    table,
    totalScores,
    getSpecificRoundScore,
    getTotalScoreUpToRound,
    getCalculationSteps,
    generateScoreQuestion,
    generateTotalScoreQuestion,
    generateOperationQuestion,
    generateTrueFalseQuestion,
    generateRoundOffQuestion
  };
};
