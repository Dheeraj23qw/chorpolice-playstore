export const generateRoundOffQuestion = (
  difficulty: "easy" | "medium" | "hard" | null
) => {
  const score =
    difficulty === "easy"
      ? Math.floor(Math.random() * 90) + 10 
      : difficulty === "medium"
      ? Math.floor(Math.random() * 900) + 100 
      : Math.floor(Math.random() * 9000) + 1000; 

  const roundingStep =
    difficulty === "easy" ? 10 : difficulty === "medium" ? 100 : 1000;
  
  // Extract the right digit based on the rounding step
  let roundingDigit;
  if (roundingStep === 10) {
    // Check the ones place for rounding to tens
    roundingDigit = Math.floor(score % 10);
  } else if (roundingStep === 100) {
    // Check the tens place for rounding to hundreds
    roundingDigit = Math.floor((score % 100) / 10);
  } else if (roundingStep === 1000) {
    // Check the hundreds place for rounding to thousands
    roundingDigit = Math.floor((score % 1000) / 100);
  }

  // Apply rounding based on the right digit
  const roundedScore =
    (roundingDigit?? 0) >= 5
      ? Math.ceil(score / roundingStep) * roundingStep
      : Math.floor(score / roundingStep) * roundingStep;

  // Prepare description
  const roundOffDescription = `Round off ${score} to the nearest ${roundingStep}.`;

  const options = [
    roundedScore.toString(), 
    (roundedScore + roundingStep).toString(), 
    (roundedScore - roundingStep).toString(), 
  ].sort(() => Math.random() - 0.5); 

  // Hint with explanation
  const hint = `Round ${score} to the nearest ${roundingStep}.\n\n` +
  `Look at the digit just to the right of the ${roundingStep === 10 ? 'tens' : roundingStep === 100 ? 'hundreds' : 'thousands'} place. It’s ${roundingDigit}, and: \n` +
  `${(roundingDigit?? 0) >= 5 ? 'If it’s 5 or more, we round up.' : 'If it’s less than 5, we round down.'}\n\n` +
  `So, ${score} rounded to the nearest ${roundingStep} is ${roundedScore}.`;



  return {
    question: `${roundOffDescription} What is the rounded-off score?`,
    options,
    correctAnswer: roundedScore.toString(),
    hint,
    boolean: false

  };
};
