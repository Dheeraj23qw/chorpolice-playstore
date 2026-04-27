import { storage } from "@/storage/mmkv";

const CLAIMED_REWARDS_KEY = "claimed_rewards";

export const getClaimedRewards = (): number[] => {
  try {
    const data = storage.getString(CLAIMED_REWARDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const markRewardClaimed = (id: number) => {
  try {
    const existing = getClaimedRewards();

    if (!existing.includes(id)) {
      const updated = [...existing, id];
      storage.set(CLAIMED_REWARDS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save claimed reward", e);
  }
};

const resetClaimedRewards = () => {
  try {
    storage.remove(CLAIMED_REWARDS_KEY);
    console.log("🗑️ Claimed rewards reset");
  } catch (e) {
    console.error("Failed to reset claimed rewards", e);
  }
};
