import { scheduleFromTemplate } from "../scheduler";
import { WELCOME_TEMPLATE } from "../templates";

const WELCOME_NOTIFICATION_DELAY_SECONDS = 8;

export async function scheduleWelcomeNotification() {
  await scheduleFromTemplate(
    WELCOME_TEMPLATE,
    WELCOME_NOTIFICATION_DELAY_SECONDS,
    undefined,
    "#22c55e",
    "default",
  );
}
