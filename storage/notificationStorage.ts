import { storage } from "@/storage/mmkv";

const NOTIFICATION_PROMPTED_KEY = "notifications_prompted_v1";
const WELCOME_NOTIFICATION_SCHEDULED_KEY = "welcome_notification_scheduled_v1";

export const hasPromptedForNotifications = () =>
  storage.getBoolean(NOTIFICATION_PROMPTED_KEY) ?? false;

export const markNotificationsPrompted = () => {
  storage.set(NOTIFICATION_PROMPTED_KEY, true);
};

export const hasScheduledWelcomeNotification = () =>
  storage.getBoolean(WELCOME_NOTIFICATION_SCHEDULED_KEY) ?? false;

export const markWelcomeNotificationScheduled = () => {
  storage.set(WELCOME_NOTIFICATION_SCHEDULED_KEY, true);
};
