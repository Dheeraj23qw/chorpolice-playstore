import { useState, useEffect } from "react";
import { generateDivisibilityQuestion } from "./utils/DivisibilityQuestion";
import { generatePlayerPositionBooleanQuestion } from "./utils/PlayerPositionBooleanQuestion";
import { generateRandomPositionQuestion } from "./utils/RandomPositionQuestion";
import { generateTotalScoreQuestion } from "./utils/TotalScoreQuestion";
import { generateScoreQuestion } from "./utils/ScoreQuestion";
import { generateRoundOffQuestion } from "./utils/RoundOffQuestion";
import { generateTrueFalseQuestion } from "./utils/TrueFalseQuestion";
import { generateOperationQuestion } from "./utils/OperationQuestion";
export const useGameTableAndScores = (
  initialDifficulty: "easy" | "medium" | "hard"
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

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    initialDifficulty
  );

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
      roundIndex = table.length - 2;
    }

    let total = 0;
    for (let i = 1; i <= roundIndex + 1; i++) {
      const roundRow = table[i];
      total += roundRow[columnIndex] as number;
    }

    return total;
  };

  const getScoreQuestion = () => {
    return generateScoreQuestion(getTotalScoreUpToRound);
  };

  const getTotalScoreQuestion = () => {
    return generateTotalScoreQuestion(getTotalScoreUpToRound);
  };

  const getRandomPositionQuestion = () => {
    return generateRandomPositionQuestion(getTotalScoreUpToRound);
  };

  const getPlayerPositionBooleanQuestion = () => {
    return generatePlayerPositionBooleanQuestion(getTotalScoreUpToRound);
  };

  const getDivisibilityQuestion = () => {
    return generateDivisibilityQuestion(getSpecificRoundScore);
  };

  const getOperationQuestion = () => {
    return generateOperationQuestion(getSpecificRoundScore);
  };

  const getTrueFalseQuestion = () => {
    return generateTrueFalseQuestion(getTotalScoreUpToRound);
  };

  const getRoundOffQuestion = () => {
    return generateRoundOffQuestion(difficulty);
  };

  const getRandomQuestion = () => {
    const questionFunctions = [
      getScoreQuestion,
      getTotalScoreQuestion,
      getRandomPositionQuestion,
      getPlayerPositionBooleanQuestion,
      getDivisibilityQuestion,
      getOperationQuestion,
      getTrueFalseQuestion,
      getRoundOffQuestion,
    ];
    const randomIndex = Math.floor(Math.random() * questionFunctions.length);
    return questionFunctions[randomIndex]();
  };

  return {
    table,
    totalScores,
    getSpecificRoundScore,
    getTotalScoreUpToRound,
    getScoreQuestion,
    getTotalScoreQuestion,
    getRandomPositionQuestion,
    getPlayerPositionBooleanQuestion,
    getDivisibilityQuestion,
    getTrueFalseQuestion,
    getRoundOffQuestion,
    getOperationQuestion,
    getRandomQuestion        
  };
};
