// time.ts

export function secondsUntilTomorrowAt(hour: number): number {
  const now = new Date();

  const target = new Date();
  target.setDate(now.getDate() + 1);
  target.setHours(hour, 0, 0, 0);

  const diff = target.getTime() - now.getTime();

  return Math.max(1, Math.floor(diff / 1000));
}
