// 1. Updated to match the lowercase keys in difficultyConfig
export type DifficultyOption = "easy" | "medium" | "hard";

// 2. Updated array values to be lowercase
export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  "easy",
  "medium",
  "hard",
];

const difficultyConfig = {
  easy: {
    icon: "leaf-outline",
    color: "#22c55e",
    desc: "A relaxed pace for everyone",
  },
  medium: {
    icon: "thunderstorm-outline",
    color: "#f59e0b",
    desc: "Test your limits",
  },
  hard: {
    icon: "skull-outline",
    color: "#ef4444",
    desc: "Only for the true experts",
  },
};
