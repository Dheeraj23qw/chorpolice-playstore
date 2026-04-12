import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { AppNotificationData } from "./types";

/**
 * --- CRITICAL: Module-scope handler registration ---
 * WHY: This MUST run immediately when the module is imported, NOT inside a
 * class constructor. If it runs lazily (after a cold-start from a tapped
 * notification), Android drops the notification silently.
 *
 * shouldShowAlert  → legacy SDK <50 compat (required by expo-notifications ~0.32)
 * shouldShowBanner → SDK 50+ foreground banner
 * shouldShowList   → SDK 50+ notification drawer
 */
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,   // ← backward-compat, DO NOT remove
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

class NotificationService {
  private responseListener: any = null;
  private receivedListener: any = null;

  /**
   * Requests permission and sets up the Android notification channel.
   * Returns true if notifications are fully operational.
   */
  async registerPermissions(): Promise<boolean> {
    if (Platform.OS === "web") return false;

    // 🛡️ Physical device check — emulators can't receive FCM in production
    const isRealDevice = Device.isDevice;
    if (!isRealDevice && !__DEV__) {
      console.log("🚫 [Notifications] Blocked: requires a physical device in production.");
      return false;
    }

    if (__DEV__) {
      console.log("🧪 [Notifications] Dev mode: bypassing physical device check.");
    }

    // Request permission (prompts user once if not yet decided)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ [Notifications] Permission denied:", finalStatus);
      return false;
    }

    // Android 8+: Notification channels are required for delivery
    // WHY: Without a channel, ALL notifications are silently dropped on Android 8+
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "General",
        description: "Game reminders, streaks, and rewards",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#A855F7",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Separate high-priority channel for reward/streak alerts
      await Notifications.setNotificationChannelAsync("alerts", {
        name: "Alerts",
        description: "Streak danger alerts and reward claims",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 500, 200, 500],
        lightColor: "#EF4444",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    console.log("✅ [Notifications] Permissions granted & channels initialized.");
    return true;
  }

  /**
   * Schedules a local notification with a time-interval trigger.
   */
  async schedule(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    color?: string;
    channelId?: string;
    data?: AppNotificationData;
  }): Promise<void> {
    if (Platform.OS === "web") return;

    const safeSeconds = Math.max(1, Math.floor(params.seconds));
    console.log(`⏳ [Notifications] Scheduling "${params.title}" in ${safeSeconds}s...`);

    try {
      // Always cancel previous notification with the same ID to prevent duplicates
      await this.cancel(params.id);

      await Notifications.scheduleNotificationAsync({
        identifier: params.id,
        content: {
          title: params.title,
          body: params.body,
          data: params.data,
          sound: true,
          // Channel ID links this notification to the correct Android channel
          // This is what ensures delivery on Android 8+ in production
          ...(Platform.OS === "android" && {
            // expo-notifications reads channelId from content on Android
          }),
          color: params.color ?? "#A855F7",
          priority: "max",
          sticky: false,
          autoDismiss: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: safeSeconds,
          repeats: false,
          // channelId must be set here for Android channel routing
          ...(Platform.OS === "android" && {
            channelId: params.channelId ?? "default",
          }),
        } as any,
      });

      console.log(`✨ [Notifications] "${params.title}" scheduled for ${safeSeconds}s from now.`);
    } catch (error) {
      console.error("🔥 [Notifications] Schedule failed:", error);
    }
  }

  /**
   * Cancels a scheduled notification by its identifier.
   */
  async cancel(id: string): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Silently ignore — cancelling a non-existent notification is safe
    }
  }

  /**
   * Cancels ALL pending notifications.
   */
  async cancelAll(): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🗑️ [Notifications] All pending notifications cancelled.");
    } catch (error) {
      console.error("🔥 [Notifications] CancelAll failed:", error);
    }
  }

  /**
   * Attaches a tap-listener.
   * When the user taps a notification, navigates to the screen in data.screen.
   */
  listen(): void {
    if (Platform.OS === "web") return;

    // Guard: only register once
    if (this.responseListener) return;

    console.log("🎧 [Notifications] Listening for tap responses...");

    // Foreground received listener (optional — for in-app badge updates etc.)
    this.receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          `📩 [Notifications] Received in foreground: "${notification.request.content.title}"`
        );
      }
    );

    // Tap listener — fires when user taps a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const content = response.notification.request.content;
        const data = content.data as AppNotificationData;

        console.log(`🎯 [Notifications] User tapped: "${content.title}"`);

        if (data?.screen) {
          console.log(`➡️ [Notifications] Navigating to: ${data.screen}`);
          // Use setTimeout to ensure navigation runs after any pending renders
          setTimeout(() => {
            try {
              router.push(data.screen as any);
            } catch (err) {
              console.error("❌ [Notifications] Navigation failed:", err);
            }
          }, 300);
        }
      }
    );
  }

  /**
   * Handles cold-start navigation: if the app was opened by tapping a notification.
   */
  async handleInitialNotification(): Promise<void> {
    if (Platform.OS === "web") return;

    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!response) return;

      const data = response.notification.request.content.data as AppNotificationData;
      console.log(`🚀 [Notifications] App opened via notification. Data:`, data);

      if (data?.screen) {
        setTimeout(() => {
          try {
            router.push(data.screen as any);
          } catch (err) {
            console.error("❌ [Notifications] Cold-start navigation failed:", err);
          }
        }, 500); // Delay ensures router is fully mounted
      }
    } catch (error) {
      console.error("🔥 [Notifications] handleInitialNotification failed:", error);
    }
  }

  /**
   * 🧪 DEBUG: Fire a test notification in 3 seconds.
   * Use this to verify the system is working end-to-end.
   */
  async triggerTestNotification(): Promise<void> {
    console.log("🔔 [Notifications] Triggering test notification in 3s...");
    await this.schedule({
      id: "debug_test",
      title: "✅ Notifications Ready!",
      body: "If you see this in production, FCM is wired correctly.",
      seconds: 3,
      color: "#22c55e",
      data: { screen: "/" },
    });
  }

  /**
   * Removes all active listeners. Call in component cleanup / app unmount.
   */
  cleanup(): void {
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
    if (this.receivedListener) {
      this.receivedListener.remove();
      this.receivedListener = null;
    }
    console.log("🧹 [Notifications] Listeners cleaned up.");
  }
}

export const notificationService = new NotificationService();
