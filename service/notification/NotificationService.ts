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
    if (Platform.OS === "web" || !Device.isDevice) return false;

    const { status: existingStatus } =
      await this.Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await this.Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    if (Platform.OS === "android") {
      await this.Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: this.Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility:
          this.Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    return true;
  }

  async schedule(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    data?: AppNotificationData;
  }): Promise<void> {
    if (Platform.OS === "web") return;

    await this.cancel(params.id);

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
async cancel(id: string): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    await this.Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.log("Cancel error:", error);
  }
}


  listen(): void {
    if (Platform.OS === "web") return;
    if (this.responseListener) return;

    this.responseListener =
      this.Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data =
            response.notification.request.content
              .data as AppNotificationData;

          if (data?.screen) {
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
