import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { usePathname, useRouter } from "expo-router";

import { toast } from "@/components/feedback/toast";
import { runtimeConfig } from "@/constants/runtime";
import { updateStreak } from "@/features/gameStreakSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { notificationService } from "@/service/notification/NotificationService";
import {
  getSpinReminderDelaySeconds,
} from "@/service/notification/controllerRules";
import {
  cancelDormantPlayerReminder,
  scheduleDormantPlayerReminder,
} from "@/service/notification/notication_types/dormantUser.notification";
import {
  cancelDailyStreakReminder,
  scheduleDailyStreakReminder,
} from "@/service/notification/notication_types/quiz.daily_streak.notifications";
import {
  cancelSpinNotification,
  scheduleSpinUnlock,
} from "@/service/notification/notication_types/spin.notification";
import { scheduleWelcomeNotification } from "@/service/notification/notication_types/welcome.notification";
import { AppRoute } from "@/service/notification/types";
import {
  hasScheduledWelcomeNotification,
  markWelcomeNotificationScheduled,
  canScheduleDailySpinNotification,
  markSpinNotificationScheduledToday,
  isNotificationsEnabled,
} from "@/storage/notificationStorage";
import { runAfterUI } from "@/utils/runAfterUI";
import { SPIN_COOLDOWN_MS } from "@/constants/spinwheel";

export default function NotificationController() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const appPhase = useAppSelector((state) => state.appFlow.phase);
  const activeModal = useAppSelector((state) => state.modalQueue.activeModal);
  const spinLastUsedTimestamp = useAppSelector(
    (state) => state.lock.spin.lastUsedTimestamp,
  );
  const currentStreak = useAppSelector(
    (state) => state.gameStreak.currentStreak,
  );
  const lastActiveDate = useAppSelector(
    (state) => state.gameStreak.lastActiveDate,
  );
  const coins = useAppSelector((state) => state.wallet.coins);
  const totalQuizzes = useAppSelector((state) => state.quizStats.totalQuizzes);
  const cpGamesPlayed = useAppSelector((state) => state.quizStats.cpGamesPlayed);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [welcomeScheduled, setWelcomeScheduled] = useState(
    hasScheduledWelcomeNotification(),
  );
  const [pendingRoute, setPendingRoute] = useState<AppRoute | null>(null);
  const appPhaseRef = useRef(appPhase);

  useEffect(() => {
    appPhaseRef.current = appPhase;
  }, [appPhase]);

  const syncPermissionState = useCallback(async () => {
    const granted = await notificationService.checkPermission();

    if (granted) {
      await notificationService.ensureChannelsExist();
    }

    setPermissionGranted(granted);
    return granted;
  }, []);

  // --- ONE-TIME MOUNT: channels, listeners, retention nudges ---
  // Must NOT depend on appPhase/activeModal — those would cause cleanup()
  // to fire on every modal open/close, dropping in-flight notification events.
  useEffect(() => {
    const init = async () => {
      // If user has disabled notifications in Home settings, exit early
      if (!isNotificationsEnabled()) return;

      // 1. Ensure notification channels exist (safe to call repeatedly)
      await notificationService.ensureChannelsExist();

      // 2. Register permission + listen (idempotent due to guard in listen())
      await notificationService.registerPermissions();
      notificationService.listen();

      // 3. Wire up handlers
      notificationService.setRouteHandler(setPendingRoute);
      notificationService.setForegroundHandler(({ title, body, route }) => {
        toast.info(title, body, {
          duration: route ? 4500 : 3200,
          actionLabel: route ? "Open" : undefined,
          onAction: route ? () => setPendingRoute(route) : undefined,
        });
      });

      // 4. Inactivity reminders — cancel stale ones first
      await notificationService.cancelRetentionNudges();
      await notificationService.scheduleRetentionNudges();
      
      // 5. Night retention notifications (rolling 30-day pool)
      await notificationService.scheduleNightRetentionNotifications({
        coins,
        streak: currentStreak,
        totalQuizzes,
        cpGamesPlayed,
        lastActiveAt: Date.now(), // Update current activity
      });

      // 6. Sync initial permission state
      const granted = await notificationService.checkPermission();
      setPermissionGranted(granted);
    };

    init();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (appPhaseRef.current === "HOME") {
          dispatch(updateStreak());
        }
        syncPermissionState();
      }
    });

    return () => {
      sub.remove();
      notificationService.cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only — intentionally no deps

  // --- PHASE/MODAL CHANGE: smart permission prompt only ---
  useEffect(() => {
    if (appPhase !== "HOME" || activeModal || !isNotificationsEnabled()) return;

    // Zomato-style: only ask if not yet granted, and not too recently denied
    notificationService.smartRequestPermissions().then((granted) => {
      setPermissionGranted(granted);
    });
  }, [appPhase, activeModal]);

  useEffect(() => {
    if (appPhase === "HOME") {
      dispatch(updateStreak());
    }
  }, [appPhase, dispatch]);

  useEffect(() => {
    if (!permissionGranted || !isNotificationsEnabled()) {
      void cancelSpinNotification();
      return;
    }

    // 🚀 STRICT 1 TIME PER DAY CHECK: User is notified max ONCE per calendar day
    if (!canScheduleDailySpinNotification()) {
      console.log("[Notifications] Daily spin notification already scheduled/sent today - skipping to avoid user irritation.");
      return;
    }

    const remainingSeconds = getSpinReminderDelaySeconds(
      spinLastUsedTimestamp,
      SPIN_COOLDOWN_MS,
    );

    if (remainingSeconds === null) {
      void cancelSpinNotification();
      return;
    }

    markSpinNotificationScheduledToday();
    void scheduleSpinUnlock(remainingSeconds);
  }, [permissionGranted, spinLastUsedTimestamp]);

  useEffect(() => {
    if (!permissionGranted || !isNotificationsEnabled()) {
      void cancelDailyStreakReminder();
      void cancelDormantPlayerReminder();
      return;
    }

    if (currentStreak > 0) {
      void scheduleDailyStreakReminder(currentStreak);
    } else {
      void cancelDailyStreakReminder();
    }

    void scheduleDormantPlayerReminder(lastActiveDate ?? undefined);
  }, [currentStreak, lastActiveDate, permissionGranted]);

  useEffect(() => {
    if (!permissionGranted || !isNotificationsEnabled() || welcomeScheduled || appPhase !== "HOME") {
      return;
    }

    markWelcomeNotificationScheduled();
    setWelcomeScheduled(true);
    void scheduleWelcomeNotification();
  }, [appPhase, permissionGranted, welcomeScheduled]);

  useEffect(() => {
    if (!pendingRoute || appPhase !== "HOME" || activeModal !== null) return;

    if (pathname === pendingRoute) {
      setPendingRoute(null);
      return;
    }

    const timeout = setTimeout(() => {
      runAfterUI(() => {
        try {
          router.push(pendingRoute as never);
        } catch (error) {
          console.error("[Notifications] Navigation failed:", error);
        } finally {
          setPendingRoute(null);
        }
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [activeModal, appPhase, pathname, pendingRoute, router]);

  return null;
}
