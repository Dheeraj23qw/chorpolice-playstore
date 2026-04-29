import { storage } from "@/storage/mmkv";
import { customAlphabet } from "nanoid/non-secure";

const AVATAR_KEY = "user_avatar";
const AVATAR_ID_KEY = "user_avatar_id";
const USERNAME_KEY = "user_name";
const PERMANENT_PLAYER_ID_KEY = "user_permanent_id";

// Custom NanoID: 8 characters, using Numbers and Uppercase letters
// This is unique enough for local play but clean for logs.
const generateShortId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  8,
);

/**
 * PHASE 1: Generate and Persist User ID
 * This runs when the app starts. If an ID doesn't exist, it creates one.
 */
const getOrGeneratePermanentId = (): string => {
  try {
    let id = storage.getString(PERMANENT_PLAYER_ID_KEY);

    if (!id) {
      // Example output: "CP-4K9P2W7X"
      id = `CP-${generateShortId()}`;
      storage.set(PERMANENT_PLAYER_ID_KEY, id);
    }

    return id;
  } catch (e) {
    console.error("Failed to load/create Permanent ID", e);
    // Fallback if storage fails
    return `TEMP-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
};

export const loadOrCreateClientPlayerId = (): string => getOrGeneratePermanentId();

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

export const saveAvatarId = (id: number) => {
  try {
    storage.set(AVATAR_ID_KEY, id);
  } catch (e) {
    console.error("Avatar ID save failed", e);
  }
};

export const loadAvatarId = (): number => {
  try {
    let id = storage.getNumber(AVATAR_ID_KEY);
    if (!id) {
      // Pick a random "kid" avatar from the 1-13 range
      id = Math.floor(Math.random() * 13) + 1;
      storage.set(AVATAR_ID_KEY, id);
    }
    return id;
  } catch {
    return 1;
  }
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
    let name = storage.getString(USERNAME_KEY);
    if (!name) {
      // Generate dynamic name: User_ followed by 3 random digits (e.g., User_132)
      const randomDigits = Math.floor(100 + Math.random() * 900);
      name = `User_${randomDigits}`;
      storage.set(USERNAME_KEY, name);
    }
    return name;
  } catch {
    return "User_000";
  }
};


