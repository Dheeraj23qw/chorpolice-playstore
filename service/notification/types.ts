export type AppRoute = "/earn" | "/";

export type AppNotificationData = {
  screen?: AppRoute;
} & Record<string, unknown>;