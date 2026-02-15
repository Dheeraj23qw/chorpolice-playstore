import { storage } from "@/storage/mmkv";

const AVATAR_KEY = "user_avatar";

// Save avatar URL — always overwrite the old one
export const saveAvatar = (uri: string) => {
  try {
    // Remove previous avatar (if exists)
    if (storage.getString(AVATAR_KEY)) {
      storage.remove(AVATAR_KEY);
    }

    // Save the new one
    storage.set(AVATAR_KEY, uri);
    if (__DEV__) console.log("💾 [Avatar] Saved successfully:", uri);
  } catch (e) {
    console.error("❌ [Avatar] Save failed", e);
  }
};

// Load avatar URL
export const loadAvatar = (): string | null => {
  try {
    return storage.getString(AVATAR_KEY) || null;
  } catch (e) {
    console.error("❌ [Avatar] Load failed", e);
    return null;
  }
};

// Reset avatar
export const resetAvatar = () => {
  storage.remove(AVATAR_KEY);
  if (__DEV__) console.log("🗑️ [Avatar] Reset successfully");
};
