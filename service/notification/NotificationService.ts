import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { runtimeConfig } from "@/constants/runtime";
import { storage } from "@/storage/mmkv";
import { AppNotificationData, AppRoute, isAppRoute } from "./types";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

interface ForegroundNotification {
  title: string;
  body?: string;
  route: AppRoute | null;
}

class NotificationService {
  private responseListener: Notifications.EventSubscription | null = null;
  private receivedListener: Notifications.EventSubscription | null = null;
  private routeHandler: ((route: AppRoute) => void) | null = null;
  private foregroundHandler:
    | ((notification: ForegroundNotification) => void)
    | null = null;

  setRouteHandler(handler: ((route: AppRoute) => void) | null) {
    this.routeHandler = handler;
  }

  setForegroundHandler(
    handler: ((notification: ForegroundNotification) => void) | null,
  ) {
    this.foregroundHandler = handler;
  }

  private canRequestPermissions() {
    return (
      Platform.OS !== "web" &&
      (Device.isDevice || !runtimeConfig.isProduction)
    );
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
      lightColor: "#22c55e",
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
      lightColor: "#f97316",
      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }

  async registerPermissions(): Promise<boolean> {
    if (Platform.OS === "web") return false;

    if (!this.canRequestPermissions()) {
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

  /**
   * Retrieves the Expo Push Token (required for remote push notifications)
   */
  async getPushToken(): Promise<string | null> {
    if (!this.canRequestPermissions()) return null;

    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) return null;

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: "d2d7084f-7e5a-4b67-a860-dc2eddc33241"
      })).data;
      
      if (__DEV__) {
        console.log("[Notifications] Push Token:", token);
      }
      return token;
    } catch (error) {
      console.error("[Notifications] Failed to get push token:", error);
      return null;
    }
  }

  async smartRequestPermissions(): Promise<boolean> {
    if (!this.canRequestPermissions()) return false;

    const { status: currentStatus, canAskAgain } = await Notifications.getPermissionsAsync();
    
    if (currentStatus === "granted") return true;
    if (currentStatus === "denied" && !canAskAgain) return false;

    const LAST_ASK_KEY = "NOTIF_LAST_ASK_TIME";
    const lastAsk = storage.getNumber(LAST_ASK_KEY) || 0;
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (currentStatus === "denied" && (now - lastAsk < sevenDays)) {
      console.log("[Notifications] Permission denied recently, skipping prompt.");
      return false;
    }

    storage.set(LAST_ASK_KEY, now);
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === "granted") {
      await this.configureChannels();
      return true;
    }

    return false;
  }

  async ensureChannelsExist(): Promise<void> {
    if (Platform.OS !== "android") return;
    const channels = await Notifications.getNotificationChannelsAsync();
    const hasDefault = channels.some((c) => c.id === "default");
    const hasAlerts = channels.some((c) => c.id === "alerts");

    if (!hasDefault || !hasAlerts) {
      console.log("[Notifications] Missing channels, re-configuring...");
      await this.configureChannels();
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
          color: params.color ?? "#22c55e",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === "android" && {
            channelId: params.channelId ?? "default",
            autoDismiss: true,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: safeSeconds,
          repeats: false,
        },
      });
    } catch (error) {
      console.error("[Notifications] Schedule failed:", error);
      return null;
    }
  }

  async scheduleSpinReminder() {
    await this.schedule({
      id: "spin_ready",
      title: "Wheel of Fortune Ready! 🎡",
      body: "Your daily spin is waiting. Come and see what you win today!",
      seconds: 2 * 60 * 60, // 2 Hours
      channelId: "alerts",
      data: { screen: "/earn" }
    });
  }

  async scheduleDailyBonusReminder() {
    await this.schedule({
      id: "daily_bonus",
      title: "Daily Treasure Available! 💰",
      body: "Don't break your streak! Collect your daily 5,000 coins now.",
      seconds: 24 * 60 * 60, // 24 Hours
      channelId: "alerts",
      data: { screen: "/earn" }
    });
  }

  async scheduleRetentionNudges() {
    await this.schedule({
      id: "retention_1d",
      title: "The Thief is Getting Away! 🏃‍♂️",
      body: "Chor Police is more fun with you. Jump back in for a quick match!",
      seconds: 24 * 60 * 60,
      data: { screen: "/mode-select" }
    });

    await this.schedule({
      id: "retention_3d",
      title: "We Miss You! 💔",
      body: "New challenges and big rewards are waiting. Play now and beat the bots!",
      seconds: 3 * 24 * 60 * 60,
      data: { screen: "/mode-select" }
    });
  }

  async cancelRetentionNudges() {
    await this.cancel("retention_1d");
    await this.cancel("retention_3d");
    await this.cancel("retention_7d");
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
        const content = notification.request.content;
        const route = this.extractRoute(content.data as AppNotificationData);

        this.foregroundHandler?.({
          title: content.title ?? "New update",
          body: content.body ?? undefined,
          route,
        });
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

  async triggerTestNotification(): Promise<{ status: 'scheduled' | 'blocked', seconds?: number, reason?: string }> {
    if (!this.canRequestPermissions()) {
      return { status: "blocked", reason: "unsupported-device" };
    }

    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.registerPermissions();
      if (!granted) {
        return { status: "blocked", reason: "permission-denied" };
      }
    }

    const seconds = runtimeConfig.debugNotificationLeadSeconds;
    const notificationId = await this.schedule({
      id: "debug_test",
      title: "Notifications Ready",
      body: "Local notification pipeline is working.",
      seconds,
      color: "#22c55e",
      data: { screen: "/mode-select" },
    });

    if (!notificationId) {
      return { status: "blocked", reason: "schedule-failed" };
    }

    return { status: "scheduled", seconds };
  }

  cleanup(): void {
    this.responseListener?.remove();
    this.receivedListener?.remove();
    this.responseListener = null;
    this.receivedListener = null;
    this.routeHandler = null;
    this.foregroundHandler = null;
  }
}

export const notificationService = new NotificationService();
