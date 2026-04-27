import { storage } from "./mmkv";

const SHARES_KEY = "REFERRAL_TOTAL_SHARES";
const EARNED_KEY = "REFERRAL_TOTAL_EARNED";

interface ReferralStats {
  totalShares: number;
  totalEarned: number;
}

export const loadReferralStats = (): ReferralStats => {
  return {
    totalShares: storage.getNumber(SHARES_KEY) || 0,
    totalEarned: storage.getNumber(EARNED_KEY) || 0,
  };
};

const LAST_REWARD_TIMESTAMP = "REFERRAL_LAST_REWARD_TS";
const DAILY_REWARD_COUNT = "REFERRAL_DAILY_REWARD_COUNT";

const canEarnShareReward = (): boolean => {
  const now = Date.now();
  const lastTs = storage.getNumber(LAST_REWARD_TIMESTAMP) || 0;
  const count = storage.getNumber(DAILY_REWARD_COUNT) || 0;

  // Reset count if more than 24h passed
  if (now - lastTs > 24 * 60 * 60 * 1000) {
    storage.set(DAILY_REWARD_COUNT, 0);
    return true;
  }

  return count < 3; // Max 3 rewards per 24h
};

export const incrementShares = (amountEarned: number): ReferralStats => {
  const current = loadReferralStats();
  const next = {
    totalShares: current.totalShares + 1,
    totalEarned: current.totalEarned + amountEarned,
  };
  
  storage.set(SHARES_KEY, next.totalShares);
  storage.set(EARNED_KEY, next.totalEarned);

  if (amountEarned > 0) {
    const currentCount = storage.getNumber(DAILY_REWARD_COUNT) || 0;
    storage.set(DAILY_REWARD_COUNT, currentCount + 1);
    storage.set(LAST_REWARD_TIMESTAMP, Date.now());
  }
  
  return next;
};
