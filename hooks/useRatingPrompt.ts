import { useEffect, useRef, useState } from "react";
import { getStreak } from "@/storage/streakStorage";
import { storage } from "@/storage/mmkv";

const RATING_COMPLETED_KEY = "rating_completed_v1";
const RATING_DISMISS_COUNT_KEY = "rating_dismiss_count";
const RATING_LAST_SHOWN_STREAK_KEY = "rating_last_shown_streak";

let ratingSessionShown = false;

export const hasRatingCompleted = () => storage.getBoolean(RATING_COMPLETED_KEY) ?? false;

export const markRatingCompleted = () => {
  storage.set(RATING_COMPLETED_KEY, true);
};

export const getDismissCount = () => storage.getNumber(RATING_DISMISS_COUNT_KEY) || 0;

export const incrementDismissCount = () => {
  const current = getDismissCount();
  storage.set(RATING_DISMISS_COUNT_KEY, current + 1);
};

export const getLastShownStreak = () => storage.getNumber(RATING_LAST_SHOWN_STREAK_KEY) || 0;

export const setLastShownStreak = (streak: number) => {
  storage.set(RATING_LAST_SHOWN_STREAK_KEY, streak);
};

export const useRatingPrompt = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (hasRatingCompleted()) return;
    if (ratingSessionShown) return;

    const streak = getStreak();
    if (streak < 3) return;
    if (streak % 3 !== 0) return;

    const dismissCount = getDismissCount();
    const lastShownStreak = getLastShownStreak();

    // Streak broke and rebuilt → reset dismiss count
    if (streak < lastShownStreak) {
      storage.set(RATING_DISMISS_COUNT_KEY, 0);
    }

    // Dismissed 2+ times and streak hasn't reached new milestone → suppress
    if (dismissCount >= 2 && streak <= lastShownStreak) return;

    // Streak reached a new 3-day milestone → reset dismiss count
    if (dismissCount >= 2 && streak > lastShownStreak) {
      storage.set(RATING_DISMISS_COUNT_KEY, 0);
    }

    ratingSessionShown = true;
    setLastShownStreak(streak);

    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    incrementDismissCount();
    setModalVisible(false);
  };

  const handleSuccess = () => {
    markRatingCompleted();
    setModalVisible(false);
  };

  return {
    modalVisible,
    handleClose,
    handleSuccess,
  };
};
