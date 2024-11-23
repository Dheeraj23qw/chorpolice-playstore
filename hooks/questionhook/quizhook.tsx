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
import { getSpecificRoundScore, getTotalScoreUpToRound } from "@/redux/reducers/quiz"; // Import the functions


export const useGameTableAndScores = () => {


  const difficulty = useSelector((state: RootState) => state.difficulty.level);
  const table = useSelector((state: RootState) => state.difficulty.table);
  const totalScores = useSelector((state: RootState) => state.difficulty.totalScores);
  const state = useSelector((state: RootState) => state.difficulty); // Getting the full state

  

  const getScoreQuestion = () => {
    return generateScoreQuestion((roundIndex, player) => getTotalScoreUpToRound(state, roundIndex, player));
  };

  const getTotalScoreQuestion = () => {
    return generateTotalScoreQuestion((roundIndex, player) => getTotalScoreUpToRound(state, roundIndex, player));
  };

  const getRandomPositionQuestion = () => {
    return generateRandomPositionQuestion((roundIndex, player) => getTotalScoreUpToRound(state, roundIndex, player));
  };

  const getPlayerPositionBooleanQuestion = () => {
    return generatePlayerPositionBooleanQuestion((roundIndex, player) => getTotalScoreUpToRound(state, roundIndex, player));
  };

  const getDivisibilityQuestion = () => {
    return generateDivisibilityQuestion((roundIndex, player) => getSpecificRoundScore(state, roundIndex, player));
  };

  const getTrueFalseQuestion = () => {
    return generateTrueFalseQuestion((roundIndex, player) => getTotalScoreUpToRound(state, roundIndex, player));
  };

  const getRoundOffQuestion = () => {
    return generateRoundOffQuestion(difficulty);
  };

  const getOperationQuestion = () => {
    return generateOperationQuestion((roundIndex, player) => getSpecificRoundScore(state, roundIndex, player));
  };

  const getRandomQuestion = () => {
    const questionFunctions = [
      // getScoreQuestion,
      // getTotalScoreQuestion,
      // getRandomPositionQuestion,
      getPlayerPositionBooleanQuestion,
      // getDivisibilityQuestion,
      // getTrueFalseQuestion,
      // getRoundOffQuestion,
      // getOperationQuestion,
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
