import { DAILY_STREAK_TEMPLATE } from "../templates";
import { scheduleFromTemplate, cancelById } from "../scheduler";
import { secondsUntilTomorrowAt } from "../utils/time";

export async function scheduleDailyStreakReminder(dailyStreak: number) {
  if (dailyStreak <= 0) {
    await cancelById(DAILY_STREAK_TEMPLATE.id);
    return;
  }

  const seconds = secondsUntilTomorrowAt(20); // 8 PM

  await scheduleFromTemplate(
    DAILY_STREAK_TEMPLATE,
    seconds,
    { streak: dailyStreak },
    "#EF4444", // Red accent — urgency color
    "chor_police_alerts"   // High-priority channel
  );
}

export async function cancelDailyStreakReminder() {
  await cancelById(DAILY_STREAK_TEMPLATE.id);
}
