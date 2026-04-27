import { storage } from "@/storage/mmkv";
import { customAlphabet } from "nanoid/non-secure";

const AVATAR_KEY = "user_avatar";
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


