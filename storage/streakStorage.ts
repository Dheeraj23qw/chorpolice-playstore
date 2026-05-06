import { storage } from "@/storage/mmkv";

const STREAK_KEY = "USER_STREAK";
const LAST_DATE_KEY = "LAST_STREAK_DATE";

/**
 * Gets the current daily streak count.
 */
export const getStreak = (): number => {
  return storage.getNumber(STREAK_KEY) || 0;
};

/**
 * Gets the last date the streak was updated (YYYY-MM-DD local).
 */
export const getLastStreakDate = (): string | undefined => {
  return storage.getString(LAST_DATE_KEY);
};

/**
 * Updates the streak based on the current date.
 * Should be called when the app starts or when the user performs a daily action.
 */
export const updateStreak = (): number => {
  // Use local date (YYYY-MM-DD) to align with user's calendar day
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  
  const lastDate = storage.getString(LAST_DATE_KEY);
  const currentStreak = storage.getNumber(STREAK_KEY) || 0;

  // 1. First time ever
  if (!lastDate) {
    storage.set(STREAK_KEY, 1);
    storage.set(LAST_DATE_KEY, today);
    return 1;
  }

  // 2. Already updated today
  if (lastDate === today) {
    return currentStreak || 1;
  }

  // 3. Check difference between calendar days
  const last = new Date(lastDate);
  const curr = new Date(today);
  
  // Reset time part to ensure we only compare dates
  last.setHours(0, 0, 0, 0);
  curr.setHours(0, 0, 0, 0);
  
  const diffTime = curr.getTime() - last.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    // Consecutive day - Increment streak
    const newStreak = currentStreak + 1;
    storage.set(STREAK_KEY, newStreak);
    storage.set(LAST_DATE_KEY, today);
    return newStreak;
  } else if (diffDays > 1) {
    // Streak broken - Reset to 1
    storage.set(STREAK_KEY, 1);
    storage.set(LAST_DATE_KEY, today);
    return 1;
  }

  // If diffDays < 0 (clock changed back), keep current streak but don't update date
  return currentStreak || 1;
};

/**
 * Resets the streak manually (e.g. for testing or specific game rules).
 */
export const resetStreak = () => {
  (storage as any).delete(STREAK_KEY);
  (storage as any).delete(LAST_DATE_KEY);
};
