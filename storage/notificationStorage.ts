import { storage } from "@/storage/mmkv";

const NOTIFICATION_PROMPTED_KEY = "notifications_prompted_v1";
const WELCOME_NOTIFICATION_SCHEDULED_KEY = "welcome_notification_scheduled_v1";
const NOTIFICATIONS_ENABLED_KEY = "app_notifications_enabled_v1";
const SPIN_NOTIFICATION_LAST_DATE_KEY = "spin_notification_last_date_v1";

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

/** Global App Push Notification Setting (User can toggle ON/OFF in settings) */
export const isNotificationsEnabled = (): boolean =>
  storage.getBoolean(NOTIFICATIONS_ENABLED_KEY) ?? true;

export const setNotificationsEnabled = (enabled: boolean): void => {
  storage.set(NOTIFICATIONS_ENABLED_KEY, enabled);
};

/** Helper to get today's date string YYYY-MM-DD */
const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** Strict Once-Per-Day Check for Spin Wheel Notifications */
export const canScheduleDailySpinNotification = (): boolean => {
  const lastDate = storage.getString(SPIN_NOTIFICATION_LAST_DATE_KEY);
  return lastDate !== getTodayDateString();
};

export const markSpinNotificationScheduledToday = (): void => {
  storage.set(SPIN_NOTIFICATION_LAST_DATE_KEY, getTodayDateString());
};
