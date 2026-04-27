import { storage } from "@/storage/mmkv";

const STORAGE_KEY = "LockState";

interface LockState {
  spin: {
    lastUsedTimestamp: number | null;
    countToday: number;
  };
  daily_bonus: {
    lastUsedTimestamp: number | null;
    countToday: number;
  };
  rate_us: {
    hasRated: boolean;
    lastPrompted: number | null;
  };
}

export const loadLocks = (): LockState | undefined => {
  try {
    const json = storage.getString(STORAGE_KEY);
    if (!json) return undefined;

    const parsed = JSON.parse(json);

    // Basic validation to ensure we have the expected structure
    return {
      spin: parsed.spin || { lastUsedTimestamp: null, countToday: 0 },
      daily_bonus: parsed.daily_bonus || { lastUsedTimestamp: null, countToday: 0 },
      rate_us: parsed.rate_us || { hasRated: false, lastPrompted: null },
    };
  } catch (e) {
    console.error("[Lock] Load failed", e);
    return undefined;
  }
};

export const saveLocks = (locks: LockState) => {
  try {
    storage.set(STORAGE_KEY, JSON.stringify(locks));
    if (__DEV__) console.log("[Lock] Saved successfully");
  } catch (e) {
    console.error("[Lock] Save failed", e);
  }
};
