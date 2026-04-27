const APP_NOTIFICATION_ROUTES = [
  "/",
  "/earn",
  "/mode-select",
  "/stats",
  "/rules-home",
] as const;

export type AppRoute = (typeof APP_NOTIFICATION_ROUTES)[number];

export type AppNotificationData = {
  screen?: AppRoute;
} & Record<string, unknown>;

export interface NotificationTemplate {
  id: string;
  titles: string[];
  bodies: string[];
  data?: Partial<AppNotificationData> & Record<string, unknown>;
}

export const isAppRoute = (value: unknown): value is AppRoute =>
  typeof value === "string" &&
  (APP_NOTIFICATION_ROUTES as readonly string[]).includes(value);
