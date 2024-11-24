const PRIME_NUMBER_DEFINITION = `Definition:\n\nNumbers greater than 1 that can only be divided by 1 and themselves are called prime numbers.\n\n`;
const EVEN_NUMBER_DEFINITION = `Definition:\n\nNumbers that can be divided by 2 without leaving a remainder are called even numbers.\n\nFor example, 2, 4, and 6 are even numbers.\n\n`;
const ODD_NUMBER_DEFINITION = `Definition:\n\nNumbers that cannot be divided by 2 completely (they leave a remainder of 1) are called odd numbers.\n\nFor example, 1, 3, and 5 are odd numbers.\n\n`;

const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const findFactors = (num: number): number[] => {
  const factors = [];
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) {
      factors.push(i);
    }
  }
  return factors;
};

export const generateTrueFalseQuestion = (
  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ) => number
) => {
  const roundIndex = Math.floor(Math.random() * 10); // Random round index
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  const selectedPlayer = players[Math.floor(Math.random() * players.length)]; // Random player
  const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer); // Get player's score
  const questionType = Math.floor(Math.random() * 3); // Random question type (even, odd, prime)
  const PLAYER_SCORE_DATA = `${selectedPlayer}'s total score at the end of round ${
    roundIndex + 1
  } is ${totalScore}\n\n`;
  let question = "";
  let isTrue = false;
  let hint = "";

  switch (questionType) {
    case 0: {
      // Check if the score is even
      question = `Is ${selectedPlayer}'s total score at the end of round ${
        roundIndex + 1
      } an even number?`;
      isTrue = totalScore % 2 === 0;
      hint = isTrue
        ? `${EVEN_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is an even number because it is divisible by 2.`
        : `${EVEN_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is not an even number because it leaves a remainder when divided by 2.`;
      break;
    }
    case 1: {
      // Check if the score is prime
      question = `Is ${selectedPlayer}'s total score at the end of round ${
        roundIndex + 1
      } a prime number?`;
      isTrue = isPrime(totalScore);
      const factors = findFactors(totalScore);
      if (isTrue) {
        hint = `${PRIME_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is a prime number because it has no divisors other than 1 and itself.\n\nFull factors: ${factors.join(
          ", "
        )}.`;
      } else if (totalScore <= 1) {
        hint = `${PRIME_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is not a prime number because prime numbers must be greater than 1.`;
      } else {
        hint = `${PRIME_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is not a prime number because it is divisible by more than just 1 and itself.\n\nFull factors: ${factors.join(
          ", "
        )}.`;
      }
      break;
    }
    case 2: {
      // Check if the score is odd
      question = `Is ${selectedPlayer}'s total score at the end of round ${
        roundIndex + 1
      } an odd number?`;
      isTrue = totalScore % 2 !== 0;
      hint = isTrue
        ? `${ODD_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is an odd number because it leaves a remainder of 1 when divided by 2.`
        : `${ODD_NUMBER_DEFINITION} ${PLAYER_SCORE_DATA} ${totalScore} is not an odd number because it is divisible by 2 without leaving a remainder.`;
      break;
    }
    default:
      throw new Error("Unexpected question type");
  }

  return {
    question,
    options: ["True", "False"],
    correctAnswer: isTrue ? "True" : "False",
    hint,
    boolean: true
  };
};
