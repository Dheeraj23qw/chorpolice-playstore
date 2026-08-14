import { storage } from "./mmkv";

const REDEEMED_CODES_KEY = "REDEEMED_CODES";

export const loadRedeemedCodes = (): string[] => {
  const raw = storage.getString(REDEEMED_CODES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveRedeemedCodes = (codes: string[]): void => {
  storage.set(REDEEMED_CODES_KEY, JSON.stringify(codes));
};

export const isCodeRedeemed = (code: string): boolean => {
  return loadRedeemedCodes().includes(code);
};

export const markCodeAsRedeemed = (code: string): void => {
  const codes = loadRedeemedCodes();
  if (!codes.includes(code)) {
    codes.push(code);
    saveRedeemedCodes(codes);
  }
};
