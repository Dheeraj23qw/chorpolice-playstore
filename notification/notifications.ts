import { Platform } from "react-native";
import * as Device from "expo-device";
import { router } from "expo-router";

type AppRoute = "/earn" | "/";

type AppNotificationData = {
  screen?: AppRoute;
} & Record<string, unknown>;

const SPIN_NOTIFICATION_ID = "spin-unlock-reminder";

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

  /**
   * ✅ Safe accessor
   */
  private get Notifications() {
    if (!this._Notifications) {
      throw new Error("Notifications not available on web");
    }
    return this._Notifications;
  }

  async registerPermissions(): Promise<boolean> {
    if (Platform.OS === "web" || !Device.isDevice) return false;

    const { status: existingStatus } =
      await this.Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await this.Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    if (Platform.OS === "android") {
      await this.Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: this.Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }

    return true;
  }

  async scheduleLocalNotification(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    data?: AppNotificationData;
  }): Promise<void> {
    if (Platform.OS === "web") return;

    await this.cancelNotificationById(params.id);

    await this.Notifications.scheduleNotificationAsync({
      identifier: params.id,
      content: {
        title: params.title,
        body: params.body,
        data: params.data,
        sound: true,
      },
      trigger: {
        type: this.Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.floor(params.seconds)),
        repeats: false,
      },
    });
  }

  async scheduleSpinUnlock(seconds: number): Promise<void> {
    const titles = [
      "🔥 BOOM! Spin is LIVE!",
      "🎉 Jackpot Time!",
      "🎡 Your Luck is Calling!",
      "💰 Rewards Waiting for You!",
      "💰 MONEY MODE ON!",
      "🚀 Ready to Win Big?",
      "🎯 HIT THE SPIN NOW!",
    ];

    const bodies = [
      "Your Lucky Spin is unlocked! Tap now and grab your reward!",
      "The wheel is on fire 🔥 Spin now before luck changes!",
      "Don't miss it! Rewards are spinning your way!",
      "Your bonus is waiting... Go spin and win BIG!",
      "Time to test your luck 😎 Hit the spin now!",
      "Coins. Rewards. Glory. Everything is waiting inside!",
      "One tap = Surprise reward 🎁 Go now!",
    ];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];

    return this.scheduleLocalNotification({
      id: SPIN_NOTIFICATION_ID,
      title: randomTitle,
      body: randomBody,
      seconds,
      data: { screen: "/earn" },
    });
  }

  async cancelNotificationById(id: string): Promise<void> {
    if (Platform.OS === "web") return;

    const scheduled =
      await this.Notifications.getAllScheduledNotificationsAsync();

    const match = scheduled.find((n: any) => n.identifier === id);

    if (match) {
      await this.Notifications.cancelScheduledNotificationAsync(
        match.identifier,
      );
    }
  }

  listen(): void {
    if (Platform.OS === "web") return;
    if (this.responseListener) return;

    this.responseListener =
      this.Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response.notification.request.content
            .data as AppNotificationData;

          if (data?.screen) {
            router.push(data.screen);
          }
        },
      );
  }

  async handleInitialNotification(): Promise<void> {
    if (Platform.OS === "web") return;

    const response =
      await this.Notifications.getLastNotificationResponseAsync();

    if (!response) return;

    const data = response.notification.request.content
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
