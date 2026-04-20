import { storage } from "@/storage/mmkv";

const NOTIFICATION_PROMPTED_KEY = "notifications_prompted_v1";

export const hasPromptedForNotifications = () =>
  storage.getBoolean(NOTIFICATION_PROMPTED_KEY) ?? false;

export const markNotificationsPrompted = () => {
  storage.set(NOTIFICATION_PROMPTED_KEY, true);
};
