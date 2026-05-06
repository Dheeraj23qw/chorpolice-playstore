import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { runtimeConfig } from "@/constants/runtime";
import { storage } from "@/storage/mmkv";
import { AppNotificationData, AppRoute, isAppRoute } from "./types";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
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
    return Platform.OS !== "web";
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

    await Notifications.setNotificationChannelAsync("chor_police_general", {
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

    await Notifications.setNotificationChannelAsync("chor_police_alerts", {
      name: "Alerts",
      description: "High-priority reminders and reward nudges",
      importance: Notifications.AndroidImportance.MAX, // Upgraded to MAX for production visibility
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

    // Always (re-)configure channels — covers fresh installs, updates,
    // and cases where the user already had permission from a previous session.
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
    
    // Always re-configure to ensure settings like importance and sound are applied
    await this.configureChannels();
  }

  async schedule(params: {
    id: string;
    title: string;
    body: string;
    seconds: number;
    color?: string;
    channelId?: "chor_police_general" | "chor_police_alerts";
    data?: AppNotificationData;
  }): Promise<string | null> {
    if (Platform.OS === "web") return null;

    const safeSeconds = Math.max(1, Math.floor(params.seconds));

    // Ensure channels exist before scheduling — guards against cases where
    // configureChannels() was never called (e.g. permission already granted
    // on a prior install, so registerPermissions() was skipped).
    await this.ensureChannelsExist();

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
            channelId: params.channelId ?? "chor_police_general",
            autoDismiss: true,
            vibrationPattern: [0, 250, 250, 250],
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
      channelId: "chor_police_alerts",
      data: { screen: "/earn" }
    });
  }

  async scheduleDailyBonusReminder() {
    await this.schedule({
      id: "daily_bonus",
      title: "Daily Treasure Available! 💰",
      body: "Don't break your streak! Collect your daily 5,000 coins now.",
      seconds: 24 * 60 * 60, // 24 Hours
      channelId: "chor_police_alerts",
      data: { screen: "/earn" }
    });
  }

  /**
   * Schedules a rolling 30-day window of night retention notifications.
   * Fires every night at 8:30 PM local time.
   */
  async scheduleNightRetentionNotifications(params?: {
    coins?: number;
    streak?: number;
    totalQuizzes?: number;
    cpGamesPlayed?: number;
    lastActiveAt?: number;
  }) {
    if (Platform.OS === "web") return;

    const VERSION = 2; // Incremented for smart selection + cooldown
    const LAST_VERSION_KEY = "NIGHT_NOTIF_SCHED_VERSION";
    const LAST_ACTIVE_KEY = "NIGHT_LAST_ACTIVE_AT";
    const RECENT_IDS_KEY = "NIGHT_RECENT_NOTIF_IDS";
    
    const now = new Date();
    const currentVersion = storage.getNumber(LAST_VERSION_KEY) || 0;

    // 1. NIGHT ACTIVITY COOLDOWN
    // If active after 7 PM today, skip tonight's notification
    if (params?.lastActiveAt) {
      storage.set(LAST_ACTIVE_KEY, params.lastActiveAt);
    }
    
    const lastActiveAt = storage.getNumber(LAST_ACTIVE_KEY) || 0;
    const lastActiveDate = new Date(lastActiveAt);
    const playedAfter7PMToday = 
      lastActiveDate.toDateString() === now.toDateString() && 
      lastActiveDate.getHours() >= 19;

    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) return;

      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const hasActiveNightNotifs = pending.some(n => n.identifier.startsWith("night_retention_"));

      // If played after 7 PM today, cancel tonight's (day 0) if it exists
      if (playedAfter7PMToday) {
        if (__DEV__) console.log("[NIGHT_RETENTION] skipped_recently_active");
        await Notifications.cancelScheduledNotificationAsync("night_retention_0");
      }

      // Only skip full re-schedule if version matches AND we have pending ones
      if (currentVersion === VERSION && hasActiveNightNotifs) {
        return;
      }

      // 1. Cancel old ones
      await this.cancelNightRetentionNotifications();

      // 2. Define Smart Pools
      const pools: Record<string, { title: string; body: string }[]> = {
        quiz: [
          { title: "🧠 Think you’re smart?", body: "Prove it in tonight’s quiz battle." },
          { title: "🔥 Quiz battle starts now.", body: "Don’t be the weak player." },
          { title: "⚡ Fast brain or fast fingers?", body: "Test both tonight." },
          { title: "😏 Embarrass your friends?", body: "Quiz mode is waiting." },
          { title: "🧠 Your brain needs XP.", body: "Play a quick quiz." },
        ],
        chor_police: [
          { title: "👑 Raja or Chor tonight?", body: "One match. One winner." },
          { title: "🕵️ Will the Thief be caught?", body: "Play now and find out." },
          { title: "⚔️ One room. Four suspects.", body: "Who’s the Thief?" },
          { title: "🕵️ Trust nobody.", body: "Play Chor Police now." },
          { title: "🚨 Squad missing one player…", body: "Join the game now." },
        ],
        comeback: [
          { title: "👀 Someone stole your crown…", body: "Take it back tonight." },
          { title: "👀 Rival got stronger…", body: "Catch up now." },
          { title: "😈 Someone is waiting.", body: "Don’t let them win." },
          { title: "🔥 Night challenge unlocked.", body: "Tap to play." },
          { title: "🔥 Tonight’s challenge is LIVE.", body: "Enter now." },
        ],
        streak: [
          { title: "🔥 Streak is alive.", body: "Don’t break it tonight." },
          { title: "🏆 Leaderboard won’t climb itself.", body: "Play now." },
          { title: "🎯 One quick match?", body: "Before sleep, let’s go." },
          { title: "⚡ Last match before bed?", body: "Quick one?" },
          { title: "🚀 No internet. No excuses.", body: "Game starts now." },
        ],
        challenge: [
          { title: "🔥 Bro ready for revenge?", body: "Your friends are waiting in Chor Police 👀" },
          { title: "⚔️ Brother vs Brother?", body: "Start the challenge now." },
          { title: "😏 Your friend can’t beat you.", body: "Or can he?" },
          { title: "😈 Friend says he’s smarter.", body: "Accept challenge?" },
          { title: "😏 Parents vs You?", body: "Let’s see who wins tonight." },
        ],
        coins: [
          { title: "🏆 Win coins. Win respect.", body: "Start a match." },
          { title: "💰 Your coins won’t earn themselves.", body: "Play now." },
          { title: "💰 Low on coins?", body: "Beat a friend and steal theirs." },
          { title: "💎 Big stakes tonight.", body: "Win big or go home." },
          { title: "💰 Your wallet is hungry.", body: "Feed it with some wins." },
        ],
        family: [
          { title: "👑 Tonight’s Raja is waiting.", body: "Will it be you?" },
          { title: "😎 Don’t just scroll.", body: "Beat someone instead." },
          { title: "🧠 Memory test tonight?", body: "Think & Count is ready." },
        ]
      };

      // 3. CONTEXTUAL MESSAGE SELECTION
      let category = "family";
      const inactiveDays = params?.lastActiveAt ? (now.getTime() - params.lastActiveAt) / (1000 * 60 * 60 * 24) : 0;

      if (inactiveDays >= 3) {
        category = "comeback";
      } else if (params?.streak && params.streak >= 3) {
        category = "streak";
      } else if (params?.coins !== undefined && params.coins < 5000) {
        category = "coins";
      } else if ((params?.totalQuizzes || 0) > (params?.cpGamesPlayed || 0) * 1.5) {
        category = "quiz";
      } else if ((params?.cpGamesPlayed || 0) > (params?.totalQuizzes || 0) * 1.5) {
        category = "chor_police";
      } else {
        category = Math.random() > 0.5 ? "challenge" : "family";
      }

      if (__DEV__) console.log(`[NIGHT_RETENTION] selected_category=${category}`);

      const pool = pools[category];
      const recentIds = storage.getString(RECENT_IDS_KEY)?.split(",") || [];

      // 4. Schedule next 30 days
      for (let i = 0; i < 30; i++) {
        // Skip today if already active after 7 PM
        if (i === 0 && playedAfter7PMToday) continue;

        const triggerDate = new Date(now);
        triggerDate.setDate(now.getDate() + i);
        triggerDate.setHours(20, 30, 0, 0);

        if (triggerDate <= now) {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }

        // Anti-repeat logic (rotate within pool but avoid recent ones for first few days)
        let messageIndex = i % pool.length;
        if (i < 3) {
          // For the immediate future, try to pick one not used in the last 3 days
          for (let j = 0; j < pool.length; j++) {
            const candidateId = `${category}_${j}`;
            if (!recentIds.includes(candidateId)) {
              messageIndex = j;
              break;
            }
          }
        }

        const selectedMessage = pool[messageIndex];
        const uniqueId = `night_retention_${i}`;

        await Notifications.scheduleNotificationAsync({
          identifier: uniqueId,
          content: {
            title: selectedMessage.title,
            body: selectedMessage.body,
            data: { screen: "/mode-select" },
            sound: "default",
            color: "#6366f1",
            categoryIdentifier: "NIGHT_RETENTION",
          },
          trigger: triggerDate as any,
        });

        // Store first notification ID for anti-repeat tracking in next session
        if (i === 0) {
          const newRecent = [`${category}_${messageIndex}`, ...recentIds.slice(0, 4)];
          storage.set(RECENT_IDS_KEY, newRecent.join(","));
        }
        
        if (__DEV__ && i < 3) console.log(`[NIGHT_RETENTION] scheduled_day=${i} index=${messageIndex}`);
      }

      storage.set(LAST_VERSION_KEY, VERSION);
    } catch (error) {
      console.error("[Notifications] scheduleNightRetentionNotifications failed:", error);
    }
  }

  async cancelNightRetentionNotifications() {
    if (Platform.OS === "web") return;
    try {
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of pending) {
        if (n.identifier.startsWith("night_retention_")) {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
    } catch {}
  }

  /**
   * Nudges the player when they are close to a milestone reward.
   * Called from Redux middleware when wallet coins change.
   */
  async scheduleMilestoneNudge(reward: string, remaining: number): Promise<void> {
    await this.schedule({
      id: "milestone_nudge",
      title: `${remaining.toLocaleString()} coins to your next reward! 🎁`,
      body: `Keep playing — your "${reward}" reward is almost unlocked.`,
      seconds: 30, // fire shortly so the user sees it while still engaged
      channelId: "chor_police_alerts",
      data: { screen: "/earn" },
    });
  }

  /**
   * Schedules inactivity retention nudges ONLY if they are not already pending.
   * This prevents the clock from resetting on every app launch — the nudge must
   * fire relative to when it was first scheduled, not the current session.
   */
  async scheduleRetentionNudges() {
    if (Platform.OS === "web") return;

    try {
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const pendingIds = new Set(pending.map((n) => n.identifier));

      if (!pendingIds.has("retention_1d")) {
        await this.schedule({
          id: "retention_1d",
          title: "The Thief is Getting Away! 🏃\u200d♂️",
          body: "Chor Police is more fun with you. Jump back in for a quick match!",
          seconds: 24 * 60 * 60,
          data: { screen: "/mode-select" },
        });
      }

      if (!pendingIds.has("retention_3d")) {
        await this.schedule({
          id: "retention_3d",
          title: "We Miss You! 💔",
          body: "New challenges and big rewards are waiting. Play now and beat the bots!",
          seconds: 3 * 24 * 60 * 60,
          data: { screen: "/mode-select" },
        });
      }
    } catch (error) {
      console.error("[Notifications] scheduleRetentionNudges failed:", error);
    }
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
