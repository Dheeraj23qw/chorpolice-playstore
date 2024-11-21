export const generateRoundOffQuestion = (
  difficulty: "easy" | "medium" | "hard"
) => {
  // Generate a random score based on difficulty
  const score =
    difficulty === "easy"
      ? Math.floor(Math.random() * 90) + 10 // Random score between 10-99
      : difficulty === "medium"
      ? Math.floor(Math.random() * 900) + 100 // Random score between 100-999
      : Math.floor(Math.random() * 9000) + 1000; // Random score between 1000-9999

  // Determine the rounding step and description based on difficulty
  const roundingStep =
    difficulty === "easy" ? 10 : difficulty === "medium" ? 100 : 1000;
  const roundedScore = Math.round(score / roundingStep) * roundingStep;
  const roundOffDescription = `Round off ${score} to the nearest ${roundingStep}.`;

  // Generate options: include the correct answer and random distractors
  const options = [
    roundedScore.toString(), // Correct answer
    (roundedScore + roundingStep).toString(), // Slightly higher distractor
    (roundedScore - roundingStep).toString(), // Slightly lower distractor
    (roundedScore + 2 * roundingStep).toString(), // Another higher distractor
  ].sort(() => Math.random() - 0.5); // Shuffle options randomly

  return {
    question: `${roundOffDescription} What is the rounded-off score?`,
    options,
    correctAnswer: roundedScore.toString(),
  };
};
