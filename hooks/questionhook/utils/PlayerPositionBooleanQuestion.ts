export const generatePlayerPositionBooleanQuestion = (
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

  const rank = Math.floor(Math.random() * 4) + 1; // Random rank (1-4)
  let currentRound = roundIndex;
  let finalPlayerScores = players.map((player) => ({
    player,
    totalScore: getTotalScoreUpToRound(currentRound, player),
  }));

  // LOOP until we find a round with unique scores to make it "EASY"
  let attempts = 0;
  while (attempts < 10) {
    const uniqueScores = new Set(finalPlayerScores.map(s => s.totalScore));
    if (uniqueScores.size === players.length) {
      break;
    }
    currentRound = Math.floor(Math.random() * (roundIndex + 1));
    finalPlayerScores = players.map((player) => ({
      player,
      totalScore: getTotalScoreUpToRound(currentRound, player),
    }));
    attempts++;
  }

  // Sort players by total score (descending)
  finalPlayerScores.sort((a, b) => b.totalScore - a.totalScore);

  const rankWord = ["first", "second", "third", "fourth"][rank - 1];
  const playerAtRank = finalPlayerScores[rank - 1]; // Player at the selected rank

  // Select a random player other than the one at rank
  const otherPlayers = players.filter(
    (player) => player !== playerAtRank.player,
  );
  const randomOtherPlayer =
    otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

  const isPlayerAtRank = Math.random() < 0.5; // Randomly decide truth value

  const question = isPlayerAtRank
    ? `Is ${playerAtRank.player} at ${rankWord} position after round ${currentRound + 1}?`
    : `Is ${randomOtherPlayer} at ${rankWord} position after round ${currentRound + 1}?`;

  const generateHint = () => {
    // Step 1: Show scores for all players
    const step1 = `Scores at Round ${currentRound + 1}:\n   - ${finalPlayerScores
      .map((p) => `${p.player}'s score = ${p.totalScore}`)
      .join("\n   - ")}`;

    // Step 2: Show comparison logic
    const step2 = `Comparing scores:\n   - ${finalPlayerScores
      .map((p) => p.player)
      .join(" > ")}`;

    // Step 3: Show correct ranking explanation
    const step3 = `Correct rank explanation:\n   - First: ${
      finalPlayerScores[0].player
    }\n   - Second: ${finalPlayerScores[1].player}\n   - Third: ${
      finalPlayerScores[2].player
    }\n   - Fourth: ${finalPlayerScores[3].player}`;

    return `${step1}\n\n${step2}\n\n${step3}`;
  };

  return {
    question,
    options: ["True", "False"], // Boolean answer options
    correctAnswer: isPlayerAtRank ? "True" : "False",
    hint: generateHint(),
    boolean: true,
  };
};

// Generate the hint
