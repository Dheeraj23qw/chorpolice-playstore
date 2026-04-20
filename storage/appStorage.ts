import { storage } from "@/storage/mmkv";

const ONBOARDING_DONE_KEY = "onboarding_done";

export const getOnboardingDone = () =>
  storage.getBoolean(ONBOARDING_DONE_KEY) ?? false;

export const setOnboardingDone = (value: boolean) => {
  storage.set(ONBOARDING_DONE_KEY, value);
};
