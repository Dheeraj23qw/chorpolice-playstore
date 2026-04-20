export type RuntimeMode = "development" | "production";

export const runtimeConfig = {
  mode: __DEV__ ? "development" : "production",
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  forceOnboardingEveryLaunch: false,
  notificationPermissionPromptDelayMs: __DEV__ ? 300 : 1200,
  debugNotificationLeadSeconds: __DEV__ ? 1 : 3,
} as const;
