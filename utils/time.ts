export const getOfferTimeData = (installTime: number, durationDays: number) => {
  const now = Date.now();

  const expiryTime = installTime + durationDays * 24 * 60 * 60 * 1000;

  const diff = expiryTime - now;

  const expired = diff <= 0;

  const totalSeconds = Math.max(Math.floor(diff / 1000), 0);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isEndingSoon = totalSeconds <= 86400; // last 24h

  return {
    expired,
    days,
    hours,
    minutes,
    seconds,
    isEndingSoon,
  };
};
