/**
 * All valid deep-link routes that notifications can navigate to.
 * Must stay in sync with templates.ts data.screen values.
 */
export type AppRoute = "/" | "/earn" | "/news" | "/stats" | "/mode-select";

export type AppNotificationData = {
  screen?: AppRoute;
} & Record<string, unknown>;

export interface NotificationTemplate {
  id: string;
  titles: string[];
  bodies: string[];
  data?: Partial<AppNotificationData> & Record<string, any>;
}
