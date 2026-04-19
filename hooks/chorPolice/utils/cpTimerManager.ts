/**
 * @file timerManager.ts
 * @description A memory-safe utility to track and batch-clear active setTimeouts.
 * WHY: Prevents memory leaks and state updates on unmounted components during
 * long animation sequences (e.g., the 11.5s dealing phase).
 */

export const createTimerManager = () => {
  // Internal registry to keep track of every active timer ID
  let timers: ReturnType<typeof setTimeout>[] = [];

  return {
    /**
     * @method add
     * @description Schedules a function and registers the timer ID.
     * @param fn - The logic to execute after the delay.
     * @param delay - Time in milliseconds.
     */
    add: (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      timers.push(t);
      return t;
    },

    /**
     * @method clearAll
     * @description Force-stops every registered timer and flushes the registry.
     * HOW: Iterates through the timer ID array and calls native clearTimeout.
     * WHY: Crucial for the cleanup phase in useEffect or when a user exits the room mid-game.
     */
    clearAll: () => {
      // Loop through all IDs and tell the JS engine to stop execution
      timers.forEach(clearTimeout);

      // Empty the array to prevent accidental re-clearing of old IDs
      timers = [];
    },
  };
};
