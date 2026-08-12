import React, { useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { AppBannerCard } from "./AppBannerCard";
import { hasPromptedForNotifications, markNotificationsPrompted } from "@/storage/notificationStorage";

export const NotificationPermissionBanner: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkPermission = useCallback(async () => {
    setIsChecking(true);
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (err) {
      console.error("[NotificationBanner] Permission check failed:", err);
      setPermissionStatus("denied");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  const handleEnable = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      markNotificationsPrompted();
    } catch (err) {
      console.error("[NotificationBanner] Permission request failed:", err);
    }
  };

  if (isChecking) return null;
  if (permissionStatus === "granted") return null;
  if (hasPromptedForNotifications()) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 140 }}
      className="mx-5 mb-4"
    >
      <AppBannerCard
        onPress={handleEnable}
        icon={<Ionicons name="notifications" size={22} color="#FBBF24" />}
        iconGlowClassName="absolute -inset-1.5 rounded-2xl bg-amber-400/15"
        iconContainerClassName="h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/20"
        title="STAY UPDATED"
        description="Enable notifications to stay informed about important updates."
        ctaContent={
          <Text className="font-main-bold text-xs tracking-wider text-black">
            ENABLE
          </Text>
        }
        ctaContainerClassName="h-10 w-auto px-4 items-center justify-center rounded-xl border border-amber-300/70 bg-amber-500 shadow-lg shadow-amber-500/40"
      />
    </MotiView>
  );
};

export default React.memo(NotificationPermissionBanner);
