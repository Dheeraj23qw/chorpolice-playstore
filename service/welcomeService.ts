import * as SecureStore from "expo-secure-store";

const WELCOME_KEY = "welcome_bonus_v1";

export const welcomeService = {
  async hasClaimed(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(WELCOME_KEY);
    return value === "claimed";
  },

  async markClaimed(): Promise<void> {
    await SecureStore.setItemAsync(WELCOME_KEY, "claimed");
  },
};
