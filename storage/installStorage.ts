import { storage } from "@/storage/mmkv";

const INSTALL_TIME_KEY = "app_installed_at";

export const initInstallTime = () => {
  try {
    const existing = storage.getString(INSTALL_TIME_KEY);

    if (!existing) {
      storage.set(INSTALL_TIME_KEY, Date.now().toString());
    }
  } catch (e) {
    console.error("Install time init failed", e);
  }
};

export const getInstallTime = (): number => {
  try {
    const value = storage.getString(INSTALL_TIME_KEY);
    return value ? Number(value) : Date.now();
  } catch {
    return Date.now();
  }
};

// 🔥 FOR TESTING
export const resetInstallTime = () => {
  try {
    storage.set(INSTALL_TIME_KEY, Date.now().toString());
    console.log("⏳ Install time reset");
  } catch (e) {
    console.error("Reset install time failed", e);
  }
};
