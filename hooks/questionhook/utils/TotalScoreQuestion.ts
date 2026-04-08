export const generateTotalScoreQuestion = (
  roundIndex: number,
  getTotalScoreUpToRound: (
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor",
  ) => number,
) => {
  const players: ("Police" | "Thief" | "King" | "Advisor")[] = [
    "Police",
    "Thief",
    "King",
    "Advisor",
  ];

  // 1. Pick the player and get the REAL score from the central roundIndex
  const selectedPlayer = players[Math.floor(Math.random() * players.length)];
  const totalScore = getTotalScoreUpToRound(roundIndex, selectedPlayer);

  // 2. Generate Options (Wrong Answers)
  const optionsSet = new Set<string>();
  optionsSet.add(totalScore.toString());

  while (optionsSet.size < 4) {
    const offset =
      (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const fakeOption = Math.abs(totalScore + offset);

    optionsSet.add(fakeOption.toString());
  }

  // 3. Shuffle
  const shuffledOptions = Array.from(optionsSet).sort(
    () => Math.random() - 0.5,
  );

  const hint = `To find the correct answer, add up all the points ${selectedPlayer} collected up to the end of Round ${roundIndex + 1}. The sum is ${totalScore}.`;

  return {
    question: `What is the total score of the ${selectedPlayer} at the end of round ${roundIndex + 1}?`,
    options: shuffledOptions,
    correctAnswer: totalScore.toString(),
    hint,
    boolean: false,
  };
};
