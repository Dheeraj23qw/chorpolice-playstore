import { useEffect, useRef, useState } from "react";
import { getStreak } from "@/storage/streakStorage";
import { storage } from "@/storage/mmkv";

const RATING_COMPLETED_KEY = "rating_completed_v1";

let ratingSessionShown = false;

export const hasRatingCompleted = () => storage.getBoolean(RATING_COMPLETED_KEY) ?? false;

export const markRatingCompleted = () => {
  storage.set(RATING_COMPLETED_KEY, true);
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

    ratingSessionShown = true;

    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setModalVisible(false);

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
