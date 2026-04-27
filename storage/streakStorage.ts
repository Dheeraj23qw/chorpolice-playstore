import { storage } from "@/storage/mmkv";

const STREAK_KEY = "USER_STREAK";
const LAST_DATE_KEY = "LAST_STREAK_DATE";

const getStreak = () => {
  return storage.getNumber(STREAK_KEY) || 1;
};

export const updateStreak = () => {
  const today = new Date().toISOString().split("T")[0];
  const lastDate = storage.getString(LAST_DATE_KEY);

  if (!lastDate) {
    storage.set(STREAK_KEY, 1);
    storage.set(LAST_DATE_KEY, today);
    return 1;
  }

  if (lastDate === today) {
    return storage.getNumber(STREAK_KEY) || 1;
  }

  const last = new Date(lastDate);
  const current = new Date(today);
  const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 1) {
    const newStreak = (storage.getNumber(STREAK_KEY) || 1) + 1;
    storage.set(STREAK_KEY, newStreak);
    storage.set(LAST_DATE_KEY, today);
    return newStreak;
  } else if (diffDays > 1) {
    storage.set(STREAK_KEY, 1);
    storage.set(LAST_DATE_KEY, today);
    return 1;
  }

  return storage.getNumber(STREAK_KEY) || 1;
};
