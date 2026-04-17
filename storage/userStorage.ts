import { storage } from "@/storage/mmkv";

const AVATAR_KEY = "user_avatar";
const USERNAME_KEY = "user_name";

export const saveAvatar = (uri: string) => {
  try {
    storage.set(AVATAR_KEY, uri);
  } catch (e) {
    console.error("Avatar save failed", e);
  }
};

export const loadAvatar = (): string | null => {
  return storage.getString(AVATAR_KEY) || null;
};

export const saveUsername = (name: string) => {
  try {
    storage.set(USERNAME_KEY, name);
  } catch (e) {
    console.error("Username save failed", e);
  }
};

export const loadUsername = (): string => {
  try {
    return storage.getString(USERNAME_KEY) || "PLAYER";
  } catch {
    return "PLAYER";
  }
};

export const resetUserData = () => {
  storage.remove(AVATAR_KEY);
  storage.remove(USERNAME_KEY);
};
