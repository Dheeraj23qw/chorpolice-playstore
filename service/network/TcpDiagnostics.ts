/**
 * Shared diagnostics for TCP networking to prevent circular dependencies.
 */
export const TCP_STATS = {
  totalSafeSendAttempts: 0,
  totalSafeSendSuccess: 0,
  totalSafeSendDroppedDestroyed: 0,
  totalSafeSendDroppedNotOpen: 0,
  totalStaleCallbacksIgnored: 0,
  totalStaleTimeoutsIgnored: 0,
  totalSocketCleanupCompleted: 0,
};

export const resetTcpStats = () => {
  TCP_STATS.totalSafeSendAttempts = 0;
  TCP_STATS.totalSafeSendSuccess = 0;
  TCP_STATS.totalSafeSendDroppedDestroyed = 0;
  TCP_STATS.totalSafeSendDroppedNotOpen = 0;
  TCP_STATS.totalStaleCallbacksIgnored = 0;
  TCP_STATS.totalStaleTimeoutsIgnored = 0;
  TCP_STATS.totalSocketCleanupCompleted = 0;
};

export const reportStaleEvent = (isTimeout: boolean) => {
  if (isTimeout) TCP_STATS.totalStaleTimeoutsIgnored++;
  else TCP_STATS.totalStaleCallbacksIgnored++;
};
