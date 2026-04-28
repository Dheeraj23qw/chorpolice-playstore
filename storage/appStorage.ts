import { storage } from "@/storage/mmkv";

const ONBOARDING_DONE_KEY = "onboarding_done";
const PERMISSION_REMINDER_SUPPRESSED = "permission_reminder_suppressed";

export const getOnboardingDone = () =>
  storage.getBoolean(ONBOARDING_DONE_KEY) ?? false;

export const setOnboardingDone = (value: boolean) => {
  storage.set(ONBOARDING_DONE_KEY, value);
};

export const getPermissionReminderSuppressed = () =>
  storage.getBoolean(PERMISSION_REMINDER_SUPPRESSED) ?? false;

export const setPermissionReminderSuppressed = (value: boolean) => {
  storage.set(PERMISSION_REMINDER_SUPPRESSED, value);
};
