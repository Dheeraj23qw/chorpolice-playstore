import { Platform } from "react-native";
import * as Device from "expo-device";
import { router } from "expo-router";
import { AppNotificationData} from "./types";



class NotificationService {
  private _Notifications: typeof import("expo-notifications") | null = null;
  private responseListener: any = null;

  constructor() {
    if (Platform.OS !== "web") {
      const Notifications = require("expo-notifications");

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      this._Notifications = Notifications;
    }
  }

  private get Notifications() {
    if (!this._Notifications) {
      throw new Error("Notifications not available on web");
    }
    return this._Notifications;
  }

  async registerPermissions(): Promise<boolean> {
    // 🛡️ DEV MODE BYPASS: Allow simulators to request/mock permissions if in development
    if (Platform.OS === "web") return false;
    
    const isRealDevice = Device.isDevice;
    if (!isRealDevice && !__DEV__) {
      console.log("🚫 [NotificationService] Blocked: Notifications require a physical device in production.");
      return false;
    }

    if (__DEV__) {
       console.log("🧪 [NotificationService] Dev mode: Bypassing physical device check...");
    }

    const { status: existingStatus } =
      await this.Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await this.Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ [NotificationService] Permissions denied:", finalStatus);
      return false;
    }

    if (Platform.OS === "android") {
      await this.Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: this.Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#A855F7", // Beautiful purple light
        lockscreenVisibility:
          this.Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    console.log("✅ [NotificationService] Permissions granted & Channel initialized.");
    return true;
  }

  async schedule(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    color?: string; // For beauty
    data?: AppNotificationData;
  }): Promise<void> {
    if (Platform.OS === "web") return;

    console.log(`⏳ [NotificationService] Scheduling: "${params.title}" in ${params.seconds}s...`);

    try {
      await this.cancel(params.id);

      await this.Notifications.scheduleNotificationAsync({
        identifier: params.id,
        content: {
          title: params.title,
          body: params.body,
          data: params.data,
          sound: true,
          color: params.color || "#A855F7", // Default brand purple
          priority: "max",
        },
        trigger: {
          type: this.Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, Math.floor(params.seconds)),
          repeats: false,
        },
      });
      console.log("✨ [NotificationService] Schedule successful.");
    } catch (error) {
      console.error("🔥 [NotificationService] Schedule failed:", error);
    }
  }

  /**
   * 🧪 DEBUG: Fire a beautiful test notification immediately (3s delay)
   */
  async triggerTestNotification(): Promise<void> {
    console.log("🔔 [NotificationService] Triggering test notification...");
    await this.schedule({
      id: "debug_test",
      title: "BOOM! 🚀 Notifications Ready",
      body: "This is a beautiful test notification. If you see this, your system is working perfectly in dev mode!",
      seconds: 3,
      color: "#22c55e", // Success green
      data: { screen: "/" }
    });
  }

  async cancel(id: string): Promise<void> {
    if (Platform.OS === "web") return;

    try {
      await this.Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      // Silence cancel errors for non-existent notifications
    }
  }

  listen(): void {
    if (Platform.OS === "web") return;
    if (this.responseListener) return;

    console.log("🎧 [NotificationService] Listening for responses...");

    this.responseListener =
      this.Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const content = response.notification.request.content;
          const data = content.data as AppNotificationData;

          console.log(`🎯 [NotificationService] User tapped notification: "${content.title}"`);

          if (data?.screen) {
            const { router } = require("expo-router");
            console.log(`➡️ [NotificationService] Navigating to: ${data.screen}`);
            router.push(data.screen);
          }
        }
      );
  }

  async handleInitialNotification(): Promise<void> {
    if (Platform.OS === "web") return;

    const response =
      await this.Notifications.getLastNotificationResponseAsync();

    if (!response) return;

    const data =
      response.notification.request.content
        .data as AppNotificationData;

    if (data?.screen) {
      router.push(data.screen);
    }
  }

  cleanup(): void {
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export const notificationService = new NotificationService();
