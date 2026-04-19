import { storage } from "@/storage/mmkv";

const AVATAR_KEY = "user_avatar";
const USERNAME_KEY = "user_name";
const CLIENT_PLAYER_ID_KEY = "client_player_id";

const createClientPlayerId = () =>
  `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

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

export const loadOrCreateClientPlayerId = (): string => {
  try {
    const existing = storage.getString(CLIENT_PLAYER_ID_KEY);
    if (existing) {
      return existing;
    }

    const nextId = createClientPlayerId();
    storage.set(CLIENT_PLAYER_ID_KEY, nextId);
    return nextId;
  } catch {
    return createClientPlayerId();
  }
};

export const resetUserData = () => {
  storage.remove(AVATAR_KEY);
  storage.remove(USERNAME_KEY);
  storage.remove(CLIENT_PLAYER_ID_KEY);
};
