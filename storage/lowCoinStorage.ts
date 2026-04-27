// lowCoinStorage.ts
import { storage } from "@/storage/mmkv";

const KEY = "LOW_COIN_REWARD";
const LOW_COIN_COOLDOWN_MS = 1000 * 60 * 60 * 24;

type LowCoinState = {
  disabledForever: boolean;
  lastDismissed: number | null;
};

const defaultState: LowCoinState = {
  disabledForever: false,
  lastDismissed: null,
};

const getLowCoinState = (): LowCoinState => {
  try {
    const raw = storage.getString(KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
};

const setLowCoinState = (state: LowCoinState) => {
  storage.set(KEY, JSON.stringify(state));
};

const disableForever = () => {
  setLowCoinState({
    disabledForever: true,
    lastDismissed: Date.now(),
  });
};

const dismissTemp = () => {
  setLowCoinState({
    disabledForever: false,
    lastDismissed: Date.now(),
  });
};

export const canShowLowCoinModal = (now = Date.now()) => {
  const state = getLowCoinState();

  if (state.disabledForever) return false;

  if (
    state.lastDismissed &&
    now - state.lastDismissed < LOW_COIN_COOLDOWN_MS
  ) {
    return false;
  }

  return true;
};
