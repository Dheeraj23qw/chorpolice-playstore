import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// ---------- CONFIG ----------
const MAX_LEVEL = 20;
const MAX_COINS = 250_000_000; // 25 crore
const MIN_COINS = 10_000;      // Level 1 starts at 10k coins

export const usePlayerLevel = () => {
  const coins = useSelector((state: RootState) => state.wallet.coins);

  const { level, xp, nextLevelXp } = useMemo(() => {
    // Progressive coin thresholds per level
    const levelThresholds: number[] = [];
    for (let i = 0; i < MAX_LEVEL; i++) {
      // Exponential growth: start low, end at MAX_COINS
      const fraction = i / (MAX_LEVEL - 1);
      const threshold = Math.round(MIN_COINS + fraction ** 2 * (MAX_COINS - MIN_COINS));
      levelThresholds.push(threshold);
    }

    let currentLevel = 1;
    let nextLevel = levelThresholds[0];

    for (let i = 0; i < MAX_LEVEL; i++) {
      if (coins >= levelThresholds[i]) {
        currentLevel = i + 2;
        nextLevel = levelThresholds[i + 1] || levelThresholds[MAX_LEVEL - 1];
      } else {
        nextLevel = levelThresholds[i];
        break;
      }
    }

    const prevLevelXP = levelThresholds[currentLevel - 2] || 0;
    const currentXP = coins - prevLevelXP;

    return {
      level: Math.min(currentLevel, MAX_LEVEL),
      xp: currentXP,
      nextLevelXp: nextLevel - prevLevelXP,
    };
  }, [coins]);

  return { level, xp, nextLevelXp };
};
