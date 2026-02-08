export type RewardTier = {
  id: number;
  coinsRequired: number;
  reward: string;
  emoji: string;
};

// Constant moved outside to prevent re-creation on every render
export const REWARD_TIERS: RewardTier[] = [
  { id: 1, coinsRequired: 2500000, reward: "Badminton Kit", emoji: "🏸" },
  { id: 2, coinsRequired: 6000000, reward: "Cricket Bat", emoji: "🏏" },
  { id: 3, coinsRequired: 10000000, reward: "₹1,000 Cash", emoji: "💰" },
];