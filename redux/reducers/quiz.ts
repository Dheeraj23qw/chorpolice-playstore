import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DifficultyState {
  level: "easy" | "medium" | "hard" | null;
  table: (number | string)[][];
  totalScores: Record<string, number>;
  totalQuestions: number;
  correctQuestions: number;
  isWinner: boolean;
}

const initialState: DifficultyState = {
  level: null,
  table: [["Round", "Police", "Thief", "King", "Advisor"]],
  totalScores: { Police: 0, Thief: 0, King: 0, Advisor: 0 },
  totalQuestions: 2,
  correctQuestions: 0,
  isWinner: false,
};

const difficultySlice = createSlice({
  name: "difficulty",
  initialState,
  reducers: {
    setDifficulty: (
      state,
      action: PayloadAction<"easy" | "medium" | "hard">
    ) => {
      state.level = action.payload;
      state.table = generateTable(action.payload);
      state.totalScores = generateTotalScores(state.table);
      state.correctQuestions = 0;
      state.isWinner = false;
    },
    resetDifficulty: (state) => {
      state.level = null;
      state.table = [["Round", "Police", "Thief", "King", "Advisor"]];
      state.totalScores = { Police: 0, Thief: 0, King: 0, Advisor: 0 };
      state.correctQuestions = 0;
      state.isWinner = false;
    },
    setCorrectAnswers: (state, action: PayloadAction<number>) => {
      state.correctQuestions = action.payload;

      // Check if all questions are correct
      if (state.correctQuestions === state.totalQuestions) {
        state.isWinner = true;
      } else {
        state.isWinner = false;
      }
    },
  },
});

const generateRandomNumber = (
  difficulty: "easy" | "medium" | "hard" | null
): number => {
  if (difficulty === "easy") return Math.floor(Math.random() * 9) + 1;
  if (difficulty === "medium") return Math.floor(Math.random() * 90) + 10;
  return Math.floor(Math.random() * 900) + 100;
};

const generateTable = (difficulty: "easy" | "medium" | "hard" | null) => {
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

  return [header, ...rows];
};

const generateTotalScores = (table: (number | string)[][]) => {
  const rows = table.slice(1); // Skip the header row
  return rows.reduce(
    (acc, row) => {
      acc.Police += row[1] as number;
      acc.Thief += row[2] as number;
      acc.King += row[3] as number;
      acc.Advisor += row[4] as number;
      return acc;
    },
    { Police: 0, Thief: 0, King: 0, Advisor: 0 }
  );
};

// Function to get the score for a specific round and player
const getSpecificRoundScore = (
  state: DifficultyState,
  roundIndex: number,
  player: "Police" | "Thief" | "King" | "Advisor"
): number => {
  const playerColumnMap = { Police: 1, Thief: 2, King: 3, Advisor: 4 };
  const columnIndex = playerColumnMap[player];
  if (state.table.length <= roundIndex + 1 || !state.table[roundIndex + 1]) {
    return 0;
  }
  const roundRow = state.table[roundIndex + 1];
  return (roundRow[columnIndex] as number) || 0;
};

const getTotalScoreUpToRound = (
  state: DifficultyState,
  roundIndex: number,
  player: "Police" | "Thief" | "King" | "Advisor"
): number => {
  const playerColumnMap = { Police: 1, Thief: 2, King: 3, Advisor: 4 };
  const columnIndex = playerColumnMap[player];

  if (roundIndex >= state.table.length - 1) {
    roundIndex = state.table.length - 2;
  }

  let total = 0;
  for (let i = 1; i <= roundIndex + 1; i++) {
    const roundRow = state.table[i];
    total += roundRow[columnIndex] as number;
  }

  return total;
};

export const { setDifficulty, resetDifficulty, setCorrectAnswers } =
  difficultySlice.actions;

export default difficultySlice.reducer;

export { getSpecificRoundScore, getTotalScoreUpToRound };
