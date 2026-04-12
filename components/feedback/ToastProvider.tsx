import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Animated, Dimensions } from "react-native";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { toastStore, ToastPayload, ToastType } from "./toast";

const { width } = Dimensions.get("window");

/* ── Theme per type ── */
const THEME: Record<ToastType, { bg: string; border: string; icon: any; iconColor: string; accent: string }> = {
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

/**
 * Premium Toast Provider — renders at the top of the screen with
 * smooth native-driver slide + fade animations.
 * Mount once in _layout.tsx.
 */
export const ToastProvider = () => {
  const [data, setData] = useState<ToastPayload | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setData(null));
  }, [translateY, opacity]);

  const show = useCallback((payload: ToastPayload) => {
    // Kill any existing timer
    if (timer.current) clearTimeout(timer.current);

    setData(payload);
    translateY.setValue(-120);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    timer.current = setTimeout(() => {
      dismiss();
    }, payload.duration || 3000);
  }, [translateY, opacity, dismiss]);

  useEffect(() => {
    toastStore.subscribe(show);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [show]);

  if (!data) return null;

  const theme = THEME[data.type];

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 20,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          // Glass effect base
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Solid dark backdrop for readability */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0a0a14",
            borderRadius: 20,
            opacity: 0.92,
          }}
        />

        {/* Icon */}
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.bg,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            zIndex: 1,
          }}
        >
          <Ionicons name={theme.icon} size={20} color={theme.iconColor} />
        </View>

        {/* Text */}
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text
            className="font-main-bold text-sm"
            style={{ color: theme.accent }}
            numberOfLines={1}
          >
            {data.title}
          </Text>
          {data.body ? (
            <Text
              className="font-main-regular text-xs"
              style={{ color: "rgba(255,255,255,0.5)", marginTop: 2 }}
              numberOfLines={2}
            >
              {data.body}
            </Text>
          ) : null}
        </View>

        {/* Accent line at top */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 24,
            right: 24,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.accent,
            opacity: 0.4,
          }}
        />
      </View>
    </Animated.View>
  );
};
