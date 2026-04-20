// Returns the number of seconds from now until tomorrow at the given hour.
export function secondsUntilTomorrowAt(hour: number, now = new Date()): number {
  const target = new Date(now);
  target.setDate(now.getDate() + 1);
  target.setHours(hour, 0, 0, 0);

  const diff = target.getTime() - now.getTime();
  return Math.max(1, Math.floor(diff / 1000));
}

export function secondsUntilDate(date: Date, nowMs = Date.now()): number | null {
  const diff = date.getTime() - nowMs;

  if (diff <= 0) return null;

  return Math.max(1, Math.floor(diff / 1000));
}
