import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { router } from "expo-router";

/**
 * ------------------------------------------------
 * SDK 54+ Notification Handler
 * ------------------------------------------------
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * ------------------------------------------------
 * STRICTLY TYPED ROUTES
 * ------------------------------------------------
 */
type AppRoute = "/earn" | "/"; // Add more routes if needed

type AppNotificationData = {
  screen?: AppRoute;
} & Record<string, unknown>;

const SPIN_NOTIFICATION_ID = "spin-unlock-reminder";

class NotificationService {
  private responseListener: Notifications.Subscription | null = null;

  /**
   * ------------------------------------------------
   * Register Permissions (Web-safe)
   * ------------------------------------------------
   */
  async registerPermissions(): Promise<boolean> {
    // Push notifications only work on physical devices
    if (Platform.OS === "web" || !Device.isDevice) {
      console.log("Push notifications are only supported on physical devices");
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }

    return true;
  }

  /**
   * ------------------------------------------------
   * Generic Scheduler
   * ------------------------------------------------
   */
  async scheduleLocalNotification(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    data?: AppNotificationData;
  }): Promise<void> {
    if (Platform.OS === "web") return; // Skip on web

    try {
      await this.cancelNotificationById(params.id);

      await Notifications.scheduleNotificationAsync({
        identifier: params.id,
        content: {
          title: params.title,
          body: params.body,
          data: params.data,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, Math.floor(params.seconds)), // Avoid zero
          repeats: false,
        },
      });
    } catch (error) {
      console.log("Schedule error:", error);
    }
  }

  /**
   * ------------------------------------------------
   * Spin Unlock Reminder
   * ------------------------------------------------
   */
  async scheduleSpinUnlock(seconds: number): Promise<void> {
    return this.scheduleLocalNotification({
      id: SPIN_NOTIFICATION_ID,
      title: "🎡 Spin is Ready!",
      body: "Your Lucky Spin is unlocked. Come win rewards!",
      seconds,
      data: { screen: "/earn" },
    });
  }

  /**
   * ------------------------------------------------
   * Cancel Specific Notification
   * ------------------------------------------------
   */
  async cancelNotificationById(id: string): Promise<void> {
    if (Platform.OS === "web") return;

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      const match = scheduled.find((n) => n.identifier === id);

      if (match) {
        await Notifications.cancelScheduledNotificationAsync(match.identifier);
      }
    } catch (error) {
      console.log("Cancel error:", error);
    }
  }

  /**
   * ------------------------------------------------
   * Handle Notification Tap (Foreground & Background)
   * ------------------------------------------------
   */
  listen(): void {
    if (Platform.OS === "web") return; // Skip web
    if (this.responseListener) return;

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as AppNotificationData;
        if (data?.screen) {
          router.push(data.screen);
        }
      }
    );
  }

  /**
   * ------------------------------------------------
   * Handle Cold Start
   * ------------------------------------------------
   */
  async handleInitialNotification(): Promise<void> {
    if (Platform.OS === "web") return;

    const response = await Notifications.getLastNotificationResponseAsync();

    if (!response) return;

    const data = response.notification.request.content.data as AppNotificationData;

    if (data?.screen) {
      router.push(data.screen);
    }
  }

  /**
   * ------------------------------------------------
   * Cleanup
   * ------------------------------------------------
   */
  cleanup(): void {
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export const notificationService = new NotificationService();
