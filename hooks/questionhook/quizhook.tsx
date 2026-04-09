import { generateDivisibilityQuestion } from "./utils/DivisibilityQuestion";
import { generatePlayerPositionBooleanQuestion } from "./utils/PlayerPositionBooleanQuestion";
import { generateRandomPositionQuestion } from "./utils/RandomPositionQuestion";
import { generateTotalScoreQuestion } from "./utils/TotalScoreQuestion";
import { generateScoreQuestion } from "./utils/ScoreQuestion";
import { generateRoundOffQuestion } from "./utils/RoundOffQuestion";
import { generateTrueFalseQuestion } from "./utils/TrueFalseQuestion";
import { generateOperationQuestion } from "./utils/OperationQuestion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getSpecificRoundScore,
  getTotalScoreUpToRound,
} from "@/redux/reducers/quiz"; // Import the functions

export const useGameTableAndScores = () => {
  const difficulty = useSelector((state: RootState) => state.difficulty.level);
  const table = useSelector((state: RootState) => state.difficulty.table);
  const totalScores = useSelector(
    (state: RootState) => state.difficulty.totalScores,
  );
  const state = useSelector((state: RootState) => state.difficulty);

  const max_row = table.length - 1; // table has 6 rows first for names and and rest for numbers

  const getRoundIndex = () => {
    const index = Math.floor(Math.random() * max_row);
    return index;
  };

  const getScoreQuestion = () => {
    const roundIndex = getRoundIndex();
    return generateScoreQuestion(
      roundIndex,
      (rIdx, player) => getTotalScoreUpToRound(state, rIdx, player),
      max_row,
    );
  };

  const getTotalScoreQuestion = () => {
    const roundIndex = getRoundIndex();
    return generateTotalScoreQuestion(roundIndex, (roundIndex, player) =>
      getTotalScoreUpToRound(state, roundIndex, player),
    );
  };

  const getRandomPositionQuestion = () => {
    const roundIndex = getRoundIndex();
    return generateRandomPositionQuestion(roundIndex, (roundIndex, player) =>
      getTotalScoreUpToRound(state, roundIndex, player),
    );
  };

  const getPlayerPositionBooleanQuestion = () => {
    const roundIndex = getRoundIndex();

    return generatePlayerPositionBooleanQuestion(
      roundIndex,
      (roundIndex, player) => getTotalScoreUpToRound(state, roundIndex, player),
    );
  };

  const getDivisibilityQuestion = () => {
    const roundIndex = getRoundIndex();
    return generateDivisibilityQuestion(roundIndex, (roundIndex, player) =>
      getSpecificRoundScore(state, roundIndex, player),
    );
  };

  const getTrueFalseQuestion = () => {
    const roundIndex = getRoundIndex();
    return generateTrueFalseQuestion(roundIndex, (roundIndex, player) =>
      getTotalScoreUpToRound(state, roundIndex, player),
    );
  };

  const getRoundOffQuestion = () => {
    return generateRoundOffQuestion(difficulty);
  };

  const getOperationQuestion = () => {
    const roundIndex = getRoundIndex();
    return generateOperationQuestion(roundIndex, (roundIndex, player) =>
      getSpecificRoundScore(state, roundIndex, player),
    );
  };

  const getRandomQuestion = () => {
    const questionFunctions = [
      getScoreQuestion,
      getTotalScoreQuestion,
      getRandomPositionQuestion,
      getPlayerPositionBooleanQuestion,
      getDivisibilityQuestion,
      getTrueFalseQuestion,
      getRoundOffQuestion,
      getOperationQuestion,
    ];

    const randomIndex = Math.floor(Math.random() * questionFunctions.length);

    return questionFunctions[randomIndex]();
  };

  return {
    table,
    totalScores,
    getScoreQuestion,
    getTotalScoreQuestion,
    getRandomPositionQuestion,
    getPlayerPositionBooleanQuestion,
    getDivisibilityQuestion,
    getTrueFalseQuestion,
    getRoundOffQuestion,
    getOperationQuestion,
    getSpecificRoundScore,
    getTotalScoreUpToRound,
    getRandomQuestion,
  };
};
