import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";

import { ToastPayload, ToastType, toastStore } from "./toast";

const THEME: Record<
  ToastType,
  { bg: string; border: string; icon: React.ComponentProps<typeof Ionicons>["name"]; iconColor: string; accent: string }
> = {
  success: {
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.25)",
    icon: "checkmark-circle",
    iconColor: "#34d399",
    accent: "#34d399",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.25)",
    icon: "close-circle",
    iconColor: "#f87171",
    accent: "#f87171",
  },
  warning: {
    bg: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.25)",
    icon: "warning",
    iconColor: "#fbbf24",
    accent: "#fbbf24",
  },
  info: {
    bg: "rgba(99, 102, 241, 0.12)",
    border: "rgba(99, 102, 241, 0.25)",
    icon: "information-circle",
    iconColor: "#818cf8",
    accent: "#818cf8",
  },
};

export const ToastProvider = () => {
  const insets = useSafeAreaInsets();
  const [activeToast, setActiveToast] = useState<ToastPayload | null>(
    () => toastStore.getState().activeToast,
  );
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissingId = useRef<string | null>(null);

  const dismiss = useCallback(
    (toastId?: string) => {
      const resolvedToastId = toastId ?? toastStore.getState().activeToast?.id;
      if (!resolvedToastId || dismissingId.current === resolvedToastId) {
        return;
      }

      dismissingId.current = resolvedToastId;

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        toastStore.dismiss(resolvedToastId);
        dismissingId.current = null;
      });
    },
    [opacity, translateY],
  );

  useEffect(() => {
    const unsubscribe = toastStore.subscribe((state) => {
      setActiveToast(state.activeToast);
    });

    return () => {
      unsubscribe();
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeToast) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    dismissingId.current = null;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const announcement = [activeToast.title, activeToast.body]
      .filter(Boolean)
      .join(". ");
    if (announcement) {
      AccessibilityInfo.announceForAccessibility(announcement);
    }

    timer.current = setTimeout(() => {
      dismiss(activeToast.id);
    }, activeToast.duration);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [activeToast, dismiss, opacity, translateY]);

  if (!activeToast) {
    return null;
  }

  const theme = THEME[activeToast.type];
  const canPress = Boolean(activeToast.onAction);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          top: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        disabled={!canPress}
        onPress={() => {
          try {
            activeToast.onAction?.();
          } finally {
            dismiss(activeToast.id);
          }
        }}
        accessibilityRole={canPress ? "button" : "alert"}
        accessibilityLabel={activeToast.title}
        accessibilityHint={activeToast.body}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.backdrop} />

          <View
            style={[
              styles.iconShell,
              {
                backgroundColor: theme.bg,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name={theme.icon} size={20} color={theme.iconColor} />
          </View>

          <View style={styles.copy}>
            <Text
              className="font-main-bold text-sm"
              style={{ color: theme.accent }}
              numberOfLines={1}
            >
              {activeToast.title}
            </Text>

            {activeToast.body ? (
              <Text
                className="font-main text-xs"
                style={styles.body}
                numberOfLines={2}
              >
                {activeToast.body}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.accentLine,
              {
                backgroundColor: theme.accent,
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0a0a14",
    borderRadius: 20,
    opacity: 0.92,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    zIndex: 1,
  },
  copy: {
    flex: 1,
    zIndex: 1,
  },
  body: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    borderRadius: 1,
    opacity: 0.4,
  },
});
