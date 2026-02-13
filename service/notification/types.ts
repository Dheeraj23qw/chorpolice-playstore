export type AppRoute = "/earn" | "/";

export type AppNotificationData = {
  screen?: AppRoute;
} & Record<string, unknown>;

export interface NotificationTemplate {
  id: string;
  titles: string[];
  bodies: string[];
  data?: Record<string, any>;
}