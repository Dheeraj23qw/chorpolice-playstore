// lowCoinStorage.ts
import { storage } from "@/storage/mmkv";

const KEY = "LOW_COIN_REWARD";

type LowCoinState = {
  disabledForever: boolean;
  lastDismissed: number | null;
};

const defaultState: LowCoinState = {
  disabledForever: false,
  lastDismissed: null,
};

export const getLowCoinState = (): LowCoinState => {
  try {
    const raw = storage.getString(KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
};

export const setLowCoinState = (state: LowCoinState) => {
  storage.set(KEY, JSON.stringify(state));
};

export const disableForever = () => {
  setLowCoinState({
    disabledForever: true,
    lastDismissed: Date.now(),
  });
};

export const dismissTemp = () => {
  setLowCoinState({
    disabledForever: false,
    lastDismissed: Date.now(),
  });
};
