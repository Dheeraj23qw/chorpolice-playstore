import { useRef, useEffect } from "react";

export const useTimeoutManager = (isLocked: boolean) => {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const safeSetTimeout = (callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      if (!isLocked) {
        callback();
      }
    }, delay);

    timersRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (isLocked) {
      clearAllTimeouts();
    }
  }, [isLocked]);

  useEffect(() => {
    return () => {
      clearAllTimeouts(); 
    };
  }, []);

  return {
    safeSetTimeout,
    clearAllTimeouts,
  };
};
