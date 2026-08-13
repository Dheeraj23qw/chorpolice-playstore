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

export const incrementShares = (amountEarned: number): ReferralStats => {
  const current = loadReferralStats();
  const next = {
    totalShares: current.totalShares + 1,
    totalEarned: current.totalEarned + amountEarned,
  };
  
  storage.set(SHARES_KEY, next.totalShares);
  storage.set(EARNED_KEY, next.totalEarned);
  
  return next;
};
