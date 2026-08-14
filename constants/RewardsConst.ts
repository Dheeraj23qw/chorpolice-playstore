export type RewardTier = {
  id: number;
  coinsRequired: number;
  rewardCoins: number;
  reward: string;
  emoji: string;
  durationDays: number;
  icon: string;
  gradient: [string, string];
};

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 1,
    coinsRequired: 250000,
    rewardCoins: 50000,
    reward: "Silver Coin Bundle",
    emoji: "🥈",
    durationDays: 15,
    icon: "Coins",
    gradient: ["rgba(148,163,184,0.25)", "rgba(100,116,139,0.1)"],
  },
  {
    id: 2,
    coinsRequired: 500000,
    rewardCoins: 100000,
    reward: "Bronze Shield",
    emoji: "🛡️",
    durationDays: 20,
    icon: "Shield",
    gradient: ["rgba(180,130,60,0.25)", "rgba(120,80,30,0.1)"],
  },
  {
    id: 3,
    coinsRequired: 1000000,
    rewardCoins: 250000,
    reward: "Gold Treasure Chest",
    emoji: "👑",
    durationDays: 30,
    icon: "Trophy",
    gradient: ["rgba(234,179,8,0.25)", "rgba(180,130,20,0.1)"],
  },
  {
    id: 4,
    coinsRequired: 2500000,
    rewardCoins: 500000,
    reward: "Royal Crown",
    emoji: "🏆",
    durationDays: 45,
    icon: "Crown",
    gradient: ["rgba(168,85,247,0.25)", "rgba(120,40,200,0.1)"],
  },
  {
    id: 5,
    coinsRequired: 5000000,
    rewardCoins: 1500000,
    reward: "Diamond Jackpot",
    emoji: "💎",
    durationDays: 60,
    icon: "Gem",
    gradient: ["rgba(59,130,246,0.25)", "rgba(30,80,200,0.1)"],
  },
  {
    id: 6,
    coinsRequired: 10000000,
    rewardCoins: 3000000,
    reward: "Platinum Vault",
    emoji: "🏦",
    durationDays: 90,
    icon: "Vault",
    gradient: ["rgba(99,102,241,0.25)", "rgba(60,60,180,0.1)"],
  },
  {
    id: 7,
    coinsRequired: 25000000,
    rewardCoins: 10000000,
    reward: "Legendary Hoard",
    emoji: "🐉",
    durationDays: 120,
    icon: "Flame",
    gradient: ["rgba(239,68,68,0.25)", "rgba(180,30,30,0.1)"],
  },
  {
    id: 8,
    coinsRequired: 50000000,
    rewardCoins: 25000000,
    reward: "Chor Police Master",
    emoji: "⭐",
    durationDays: 180,
    icon: "Star",
    gradient: ["rgba(236,72,153,0.25)", "rgba(180,40,100,0.1)"],
  },
];
