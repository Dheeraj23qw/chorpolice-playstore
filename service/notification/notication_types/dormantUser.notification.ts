import { cancelById, scheduleFromTemplate } from "../scheduler";
import { DORMANT_PLAYER_TEMPLATE } from "../templates";
import { secondsUntilDate } from "../utils/time";

export async function scheduleDormantPlayerReminder(lastActiveDate?: string) {
  try {
    if (!lastActiveDate) {
      await cancelById(DORMANT_PLAYER_TEMPLATE.id);
      return;
    }

    const lastActive = new Date(`${lastActiveDate}T00:00:00`);
    if (Number.isNaN(lastActive.getTime())) {
      await cancelById(DORMANT_PLAYER_TEMPLATE.id);
      return;
    }

    const target = new Date(lastActive);
    target.setDate(target.getDate() + 2);
    target.setHours(20, 0, 0, 0);

    const seconds = secondsUntilDate(target);
    if (seconds === null) {
      await cancelById(DORMANT_PLAYER_TEMPLATE.id);
      return;
    }

    await scheduleFromTemplate(DORMANT_PLAYER_TEMPLATE, seconds);
  } catch (error) {
    console.error("[Notifications] Dormant reminder error:", error);
  }
}

export async function cancelDormantPlayerReminder() {
  await cancelById(DORMANT_PLAYER_TEMPLATE.id);
}
