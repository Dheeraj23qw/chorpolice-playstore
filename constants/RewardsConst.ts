export type RewardTier = {
  id: number;
  coinsRequired: number;
  rewardCoins: number; // New field
  reward: string;
  emoji: string;
  durationDays: number;
};

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 1,
    coinsRequired: 250000,
    rewardCoins: 50000,
    reward: "Silver Coin Bundle",
    emoji: "🥈",
    durationDays: 15,
  },
  {
    id: 2,
    coinsRequired: 1000000,
    rewardCoins: 250000,
    reward: "Gold Treasure Chest",
    emoji: "👑",
    durationDays: 30,
  },
  {
    id: 3,
    coinsRequired: 5000000,
    rewardCoins: 1500000,
    reward: "Diamond Jackpot",
    emoji: "💎",
    durationDays: 60,
  },
];
