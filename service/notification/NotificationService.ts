import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { AppNotificationData, AppRoute, isAppRoute } from "./types";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

class NotificationService {
  private responseListener: Notifications.EventSubscription | null = null;
  private receivedListener: Notifications.EventSubscription | null = null;
  private routeHandler: ((route: AppRoute) => void) | null = null;

  setRouteHandler(handler: ((route: AppRoute) => void) | null) {
    this.routeHandler = handler;
  }

  private extractRoute(data?: AppNotificationData): AppRoute | null {
    if (!data?.screen) return null;

    if (!isAppRoute(data.screen)) {
      console.warn("[Notifications] Ignored invalid route:", data.screen);
      return null;
    }

    return data.screen;
  }

  async configureChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    await Notifications.setNotificationChannelAsync("default", {
      name: "General",
      description: "Game reminders, streaks, and rewards",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A855F7",
      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("alerts", {
      name: "Alerts",
      description: "High-priority reminders and reward nudges",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 500, 200, 500],
      lightColor: "#EF4444",
      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }

  async registerPermissions(): Promise<boolean> {
    if (Platform.OS === "web") return false;

    if (!Device.isDevice && !__DEV__) {
      console.log(
        "[Notifications] Blocked: requires a physical device in production.",
      );
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission denied:", finalStatus);
      return false;
    }

    await this.configureChannels();
    return true;
  }

  async checkPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("[Notifications] Permission check failed:", error);
      return false;
    }
  }

  async schedule(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    color?: string;
    channelId?: "default" | "alerts";
    data?: AppNotificationData;
  }): Promise<string | null> {
    if (Platform.OS === "web") return null;

    const safeSeconds = Math.max(1, Math.floor(params.seconds));

    try {
      await this.cancel(params.id);

      return await Notifications.scheduleNotificationAsync({
        identifier: params.id,
        content: {
          title: params.title,
          body: params.body,
          data: params.data,
          sound: "default",
          color: params.color ?? "#A855F7",
          priority: Notifications.AndroidNotificationPriority.MAX,
          ...(Platform.OS === "android" && {
            channelId: params.channelId ?? "default",
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: safeSeconds,
          repeats: false,
          ...(Platform.OS === "android" && {
            channelId: params.channelId ?? "default",
          }),
        },
      });
    } catch (error) {
      console.error("[Notifications] Schedule failed:", error);
      return null;
    }
  }

  async cancel(id: string): Promise<void> {
    if (Platform.OS === "web") return;

    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }

  async cancelAll(): Promise<void> {
    if (Platform.OS === "web") return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("[Notifications] CancelAll failed:", error);
    }
  }

  listen(): void {
    if (Platform.OS === "web" || this.responseListener) return;

    this.receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          `[Notifications] Received: "${notification.request.content.title}"`,
        );
      },
    );

    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as AppNotificationData;
        const route = this.extractRoute(data);

        if (route) {
          this.routeHandler?.(route);
        }
      });
  }

  async consumeInitialRoute(): Promise<AppRoute | null> {
    if (Platform.OS === "web") return null;

    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!response) return null;

      await Notifications.clearLastNotificationResponseAsync();

      const data = response.notification.request.content
        .data as AppNotificationData;
      return this.extractRoute(data);
    } catch (error) {
      console.error("[Notifications] Failed to read initial response:", error);
      return null;
    }
  }

  async triggerTestNotification(): Promise<void> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.registerPermissions();
      if (!granted) return;
    }

    await this.schedule({
      id: "debug_test",
      title: "Notifications Ready",
      body: "Local notification pipeline is working.",
      seconds: 3,
      color: "#22c55e",
      data: { screen: "/mode-select" },
    });
  }

  cleanup(): void {
    this.responseListener?.remove();
    this.receivedListener?.remove();
    this.responseListener = null;
    this.receivedListener = null;
    this.routeHandler = null;
  }
}

export const notificationService = new NotificationService();
