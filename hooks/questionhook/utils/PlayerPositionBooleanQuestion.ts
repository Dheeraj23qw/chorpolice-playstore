export const generatePlayerPositionBooleanQuestion = (
  getTotalScoreUpToRound: (
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

  const roundIndex = Math.floor(Math.random() * 10); // Select a random round (0-9)
  const rank = Math.floor(Math.random() * 4) + 1; // Random rank (1-4)

  // Map player scores up to the selected round
  const playerScores = players.map((player) => ({
    player,
    totalScore: getTotalScoreUpToRound(roundIndex, player),
  }));

   // Define the priority for tie-breaking (King > Advisor > Police > Thief)
   const priorityOrder: { [key: string]: number } = {
    King: 1,
    Advisor: 2,
    Police: 3,
    Thief: 4,
  };

  // Sort players by total score (descending) and by priority if scores are equal
  playerScores.sort((a, b) => {
    // First, compare by score
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // If scores are equal, compare by priority
    return priorityOrder[a.player] - priorityOrder[b.player];
  });

  const rankWord = ["first", "second", "third", "fourth"][rank - 1];
  const playerAtRank = playerScores[rank - 1]; // Player at the selected rank

   // Select a random player other than the one at rank
   const otherPlayers = players.filter((player) => player !== playerAtRank.player);
   const randomOtherPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

  const isPlayerAtRank = Math.random() < 0.5; // Randomly decide truth value

 const question = isPlayerAtRank
    ? `Is ${playerAtRank.player} at ${rankWord} position after round ${roundIndex + 1}? (If scores are equal, King > Advisor > Police > Thief)`
    : `Is ${randomOtherPlayer} at ${rankWord} position after round ${roundIndex + 1}? (If scores are equal, King > Advisor > Police > Thief)`;

    const generateHint = () => {
      // Step 1: Show scores for all players
      const step1 = `Scores at Round ${roundIndex + 1}:\n   - ${playerScores
        .map((p) => `${p.player}'s score = ${p.totalScore}`)
        .join("\n   - ")}`;
  
      // Step 2: Show comparison logic
      const step2 = `Comparing scores:\n   - ${playerScores
        .map((p) => p.player)
        .join(" > ")}`;
  
      // Step 3: Show correct ranking explanation
      const step3 = `Correct rank explanation:\n   - First: ${
        playerScores[0].player
      }\n   - Second: ${playerScores[1].player}\n   - Third: ${
        playerScores[2].player
      }\n   - Fourth: ${playerScores[3].player}`;
  
      return `${step1}\n\n${step2}\n\n${step3}`;
    };

  return {
    question,
    options: ["True", "False"], // Boolean answer options
    correctAnswer: isPlayerAtRank ? "True" : "False",
    hint: generateHint(),
    boolean: true

  };
};



  // Generate the hint
