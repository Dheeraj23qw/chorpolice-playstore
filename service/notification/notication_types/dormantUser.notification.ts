// notifications/dormantUser.ts

import { cancelById, scheduleFromTemplate } from "../scheduler";
import { DORMANT_PLAYER_TEMPLATE } from "../templates";
import { secondsUntilTomorrowAt } from "../utils/time";

/**
 * Schedules or cancels dormant user notification.
 * @param lastPlayedDate - format: "YYYY-MM-DD"
 */
export async function scheduleDormantPlayerReminder(lastPlayedDate?: string) {
  try {
    // 1️⃣ If no date → nothing to check
    if (!lastPlayedDate) {
      await cancelById(DORMANT_PLAYER_TEMPLATE.id);
      return;
    }

    // 2️⃣ Convert dates safely (local midnight)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastPlayed = new Date(lastPlayedDate + "T00:00:00");

    // 3️⃣ Calculate difference in days
    const diffTime = today.getTime() - lastPlayed.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (__DEV__) {
      console.log("📅 Dormant Check:");
      console.log("Last Played:", lastPlayedDate);
      console.log("Days Inactive:", diffDays);
    }

    // 4️⃣ If inactive for 2 or more days → schedule
    if (diffDays >= 2) {
      // Prevent duplicate scheduling
      await cancelById(DORMANT_PLAYER_TEMPLATE.id);

      // Pick random title
      const title =
        DORMANT_PLAYER_TEMPLATE.titles[
          Math.floor(Math.random() * DORMANT_PLAYER_TEMPLATE.titles.length)
        ];

      // Pick random body
      let body =
        DORMANT_PLAYER_TEMPLATE.bodies[
          Math.floor(Math.random() * DORMANT_PLAYER_TEMPLATE.bodies.length)
        ];

      // Replace placeholder if exists
      body = body.replace("{days}", diffDays.toString());

      // Schedule for tomorrow 8PM
      const seconds = secondsUntilTomorrowAt(20);

      await scheduleFromTemplate(
        {
          ...DORMANT_PLAYER_TEMPLATE,
          titles: [title],
          bodies: [body],
        },
        seconds,
        { daysInactive: diffDays }
      );

      if (__DEV__) {
        console.log(
          `🟢 Dormant notification scheduled (${diffDays} day(s) inactive)`
        );
      }
    } else {
      // 5️⃣ If user active → cancel dormant reminder
      await cancelById(DORMANT_PLAYER_TEMPLATE.id);

      if (__DEV__) {
        console.log("🟢 User active — dormant notification cancelled");
      }
    }
  } catch (error) {
    console.error("❌ Dormant reminder error:", error);
  }
}
