import { storage } from "@/storage/mmkv";

const ONBOARDING_DONE_KEY = "onboarding_done";
const PERMISSION_REMINDER_SUPPRESSED = "permission_reminder_suppressed";
const LOBBY_HELP_SHOWN = "lobby_help_shown";
const SOLO_TUTORIAL_SHOWN = "solo_tutorial_shown";
const JOIN_HELP_SHOWN = "join_help_shown";
const FORCE_ONBOARDING_DEV_KEY = "force_onboarding_dev";

export const getOnboardingDone = () =>
  storage.getBoolean(ONBOARDING_DONE_KEY) ?? false;

export const setOnboardingDone = (value: boolean) => {
  storage.set(ONBOARDING_DONE_KEY, value);
};

/** Dev-only: replay the onboarding screen on every app launch. */
export const getForceOnboardingEveryLaunch = () =>
  storage.getBoolean(FORCE_ONBOARDING_DEV_KEY) ?? false;

export const setForceOnboardingEveryLaunch = (value: boolean) => {
  storage.set(FORCE_ONBOARDING_DEV_KEY, value);
};

export const getPermissionReminderSuppressed = () =>
  storage.getBoolean(PERMISSION_REMINDER_SUPPRESSED) ?? false;

export const setPermissionReminderSuppressed = (value: boolean) => {
  storage.set(PERMISSION_REMINDER_SUPPRESSED, value);
};

export const getLobbyHelpShown = () =>
  storage.getBoolean(LOBBY_HELP_SHOWN) ?? false;

export const setLobbyHelpShown = (value: boolean) => {
  storage.set(LOBBY_HELP_SHOWN, value);
};

export const getSoloTutorialShown = () =>
  storage.getBoolean(SOLO_TUTORIAL_SHOWN) ?? false;

export const setSoloTutorialShown = (value: boolean) => {
  storage.set(SOLO_TUTORIAL_SHOWN, value);
};

export const getJoinHelpShown = () =>
  storage.getBoolean(JOIN_HELP_SHOWN) ?? false;

export const setJoinHelpShown = (value: boolean) => {
  storage.set(JOIN_HELP_SHOWN, value);
};

const UPDATE_DISMISS_COUNT_PREFIX = "update_dismiss_count_";

export const getUpdateDismissCount = (version: string) =>
  storage.getNumber(`${UPDATE_DISMISS_COUNT_PREFIX}${version}`) ?? 0;

export const incrementUpdateDismissCount = (version: string) => {
  const currentCount = getUpdateDismissCount(version);
  storage.set(`${UPDATE_DISMISS_COUNT_PREFIX}${version}`, currentCount + 1);
};
