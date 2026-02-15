// rankUtils.ts

export const TOTAL_PLAYERS = 874;
export const MAX_COINS = 1000000000;

export function calculateRank(coins: number): number {
  const safeCoins = Math.max(0, coins);
  const percentile = Math.min(safeCoins / MAX_COINS, 1);

  const rank = Math.floor(TOTAL_PLAYERS - percentile * TOTAL_PLAYERS);

  return Math.max(rank, 1);
}

export function getTier(rank: number): string {
  const percentage = rank / TOTAL_PLAYERS;

  if (percentage <= 0.01) return "Diamond";
  if (percentage <= 0.05) return "Platinum";
  if (percentage <= 0.15) return "Gold";
  if (percentage <= 0.4) return "Silver";
  return "Bronze";
}

export function getTierProgress(rank: number): number {
  const percentage = rank / TOTAL_PLAYERS;

  if (percentage <= 0.01) return 1;
  if (percentage <= 0.05) return 0.8;
  if (percentage <= 0.15) return 0.6;
  if (percentage <= 0.4) return 0.3;
  return 0.1;
}
