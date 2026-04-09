import { storage } from "@/storage/mmkv";

const AVATAR_KEY = "user_avatar";
const USERNAME_KEY = "user_name"; // New Key

// --- AVATAR LOGIC ---
export const saveAvatar = (uri: string) => {
  try {
    storage.set(AVATAR_KEY, uri);
    if (__DEV__) console.log("💾 [Avatar] Saved:", uri);
  } catch (e) {
    console.error("❌ [Avatar] Save failed", e);
  }
};

export const loadAvatar = (): string | null => {
  return storage.getString(AVATAR_KEY) || null;
};

// --- USERNAME LOGIC ---

/**
 * Saves the username to storage.
 * Note: MMKV .set() automatically overwrites, so no need to remove first.
 */
export const saveUsername = (name: string) => {
  try {
    storage.set(USERNAME_KEY, name);
    if (__DEV__) console.log("💾 [Username] Saved:", name);
  } catch (e) {
    console.error("❌ [Username] Save failed", e);
  }
};

/**
 * Loads the username. Returns "PLAYER_1" as a fallback.
 */
export const loadUsername = (): string => {
  try {
    return storage.getString(USERNAME_KEY) || "PLAYER_1";
  } catch (e) {
    return "PLAYER_1";
  }
};

// --- RESET LOGIC ---
export const resetUserData = () => {
  storage.remove(AVATAR_KEY);
  storage.remove(USERNAME_KEY);
  if (__DEV__) console.log("🗑️ [User Data] Reset successfully");
};
