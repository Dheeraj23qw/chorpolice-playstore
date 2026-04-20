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
  shouldPromptForNotifications,
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
  hasPromptedForNotifications,
  hasScheduledWelcomeNotification,
  markNotificationsPrompted,
  markWelcomeNotificationScheduled,
} from "@/storage/notificationStorage";
import { runAfterUI } from "@/utils/runAfterUI";

const SPIN_COOLDOWN_MS = 12 * 60 * 60 * 1000;

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

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [prompted, setPrompted] = useState(hasPromptedForNotifications());
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
      await notificationService.configureChannels();
    }

    setPermissionGranted(granted);
    return granted;
  }, []);

  useEffect(() => {
    notificationService.setRouteHandler((route) => {
      setPendingRoute(route);
    });
    notificationService.setForegroundHandler(({ title, body, route }) => {
      toast.info(title, body, {
        duration: route ? 4500 : 3200,
        actionLabel: route ? "Open" : undefined,
        onAction: route ? () => setPendingRoute(route) : undefined,
      });
    });
    notificationService.listen();

    void (async () => {
      await syncPermissionState();
      const initialRoute = await notificationService.consumeInitialRoute();
      if (initialRoute) {
        setPendingRoute(initialRoute);
      }
    })();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (appPhaseRef.current === "HOME") {
          dispatch(updateStreak());
        }
        void syncPermissionState();
      }
    });

    return () => {
      sub.remove();
      notificationService.setForegroundHandler(null);
      notificationService.setRouteHandler(null);
      notificationService.cleanup();
    };
  }, [dispatch, syncPermissionState]);

  useEffect(() => {
    if (
      !shouldPromptForNotifications({
        prompted,
        permissionGranted,
        appPhase,
        activeModal,
      })
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      void (async () => {
        markNotificationsPrompted();
        setPrompted(true);

        const granted = await notificationService.registerPermissions();
        setPermissionGranted(granted);

        if (granted) {
          toast.success(
            "Notifications enabled",
            "Users will now get reminders and welcome alerts from the app.",
          );
        } else {
          toast.info(
            "Notifications skipped",
            "Users can still enable them later from device settings.",
          );
        }
      })();
    }, runtimeConfig.notificationPermissionPromptDelayMs);

    return () => clearTimeout(timeout);
  }, [activeModal, appPhase, permissionGranted, prompted]);

  useEffect(() => {
    if (appPhase === "HOME") {
      dispatch(updateStreak());
    }
  }, [appPhase, dispatch]);

  useEffect(() => {
    if (!permissionGranted) {
      void cancelSpinNotification();
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

    void scheduleSpinUnlock(remainingSeconds);
  }, [permissionGranted, spinLastUsedTimestamp]);

  useEffect(() => {
    if (!permissionGranted) {
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
    if (!permissionGranted || welcomeScheduled || appPhase !== "HOME") {
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
