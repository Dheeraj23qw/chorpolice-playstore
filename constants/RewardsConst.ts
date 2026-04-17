export type RewardTier = {
  id: number;
  coinsRequired: number;
  reward: string;
  emoji: string;
  durationDays: number;
};

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 1,
    coinsRequired: 2500000,
    reward: "Badminton Racket",
    emoji: "🏸",
    durationDays: 20,
  },
  {
    id: 2,
    coinsRequired: 6000000,
    reward: "Cricket Bat",
    emoji: "🏏",
    durationDays: 30,
  },
  {
    id: 3,
    coinsRequired: 10000000,
    reward: "₹1,000 Cash",
    emoji: "💰",
    durationDays: 40,
  },
];
