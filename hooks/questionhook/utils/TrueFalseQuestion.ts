const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

export const generateTrueFalseQuestion = (
  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ) => number
) => {
  const roundIndex = Math.floor(Math.random() * 10); 
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  const selectedPlayer = players[Math.floor(Math.random() * players.length)]; 

  const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

  const questionType = Math.floor(Math.random() * 3); 

  let question = "";
  let isTrue = false;

  switch (questionType) {
    case 0: {
      // Check if the score is even
      question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} an even number?`;
      isTrue = totalScore % 2 === 0;
      break;
    }
    case 1: {
      // Check if the score is prime
      question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} a prime number?`;
      isTrue = isPrime(totalScore);
      break;
    }
    case 2: {
      // Check if the score is odd
      question = `Is ${selectedPlayer}'s total score at round ${roundIndex + 1} an odd number?`;
      isTrue = totalScore % 2 !== 0;
      break;
    }
    default:
      throw new Error("Unexpected question type"); 
  }

  return {
    question,
    options: ["True", "False"],
    correctAnswer: isTrue ? "True" : "False", 
  };
};
