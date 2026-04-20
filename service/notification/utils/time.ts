// Returns the number of seconds from NOW
// until TOMORROW at the given hour (24-hour format).
// Example: hour = 20 → tomorrow at 8:00 PM
export function secondsUntilTomorrowAt(hour: number): number {

  // 1️⃣ Get current date & time
  const now = new Date();

  // 2️⃣ Create a new Date object for target time
  const target = new Date();

  // 3️⃣ Move the target date to TOMORROW
  target.setDate(now.getDate() + 1);

  // 4️⃣ Set target time to the given hour
  // hour → e.g. 20 (8 PM)
  // minutes → 0
  // seconds → 0
  // milliseconds → 0
  target.setHours(hour, 0, 0, 0);

  // 5️⃣ Calculate difference in milliseconds
  const diff = target.getTime() - now.getTime();

  // 6️⃣ Convert milliseconds → seconds
  // Math.max(1, ...) ensures we never return 0 or negative
  return Math.max(1, Math.floor(diff / 1000));
}

export function secondsUntilDate(date: Date): number | null {
  const diff = date.getTime() - Date.now();

  if (diff <= 0) return null;

  return Math.max(1, Math.floor(diff / 1000));
}
