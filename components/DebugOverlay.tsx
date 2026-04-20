import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { runtimeConfig } from "@/constants/runtime";

import { toast } from "./feedback/toast";
import { Text } from "./Text";
import { notificationService } from "../service/notification/NotificationService";
import { useDebugData } from "../service/lanGameService";
import { rf } from "../utils/responsive";

export const DebugOverlay: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const debug = useDebugData();

  if (!runtimeConfig.isDevelopment) return null;

  const handleTestNotification = async () => {
    const result = await notificationService.triggerTestNotification();

    if (result.status === "scheduled") {
      toast.success(
        "Test notification scheduled",
        `It should appear in ${result.seconds} second${result.seconds === 1 ? "" : "s"}.`,
      );
      return;
    }

    if (result.reason === "permission-denied") {
      toast.warning(
        "Permission required",
        "Allow notifications once so reminders can be tested.",
      );
      return;
    }

    if (result.reason === "unsupported-device") {
      toast.info(
        "Device required",
        "Production notification testing needs a supported device build.",
      );
      return;
    }

    toast.error(
      "Notification test failed",
      "The local notification could not be scheduled.",
    );
  };

  if (isMinimized) {
    return (
      <TouchableOpacity
        style={styles.minimizedContainer}
        onPress={() => setIsMinimized(false)}
        activeOpacity={0.8}
      >
        <Ionicons name="stats-chart" size={rf(1.5)} color="#22c55e" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>DIAGNOSTICS</Text>
          <TouchableOpacity onPress={() => setIsMinimized(true)}>
            <Ionicons
              name="close-circle-outline"
              size={rf(1.8)}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Local:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {debug.localIp}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Host:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {debug.hostIp}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Found:</Text>
          <Text style={styles.value}>{debug.discoveredHostCount}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Peers:</Text>
          <Text style={styles.value}>{debug.connectionCount}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Last Pkt:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {debug.lastPacketType}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ping:</Text>
          <Text
            style={[
              styles.value,
              { color: debug.latency > 100 ? "#ef4444" : "#22c55e" },
            ]}
          >
            {debug.latency}ms
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Hb:</Text>
          <Text
            style={[
              styles.value,
              { color: debug.isHeartbeatActive ? "#22c55e" : "#4b5563" },
            ]}
          >
            {debug.isHeartbeatActive ? "ON" : "OFF"}
          </Text>
        </View>

        <TouchableOpacity style={styles.notifButton} onPress={handleTestNotification}>
          <Ionicons name="notifications-outline" size={rf(1.2)} color="white" />
          <Text style={styles.notifButtonText}>TEST NOTIF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    left: 20,
    zIndex: 9999,
  },
  minimizedContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 9999,
  },
  content: {
    backgroundColor: "rgba(20,20,20,0.9)",
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    width: 220,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: 6,
  },
  header: {
    fontFamily: "Main-Bold",
    fontSize: rf(1),
    color: "#22c55e",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 10,
  },
  label: {
    fontFamily: "Main-Regular",
    fontSize: rf(0.9),
    color: "rgba(255,255,255,0.4)",
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Main-Bold",
    fontSize: rf(0.9),
    color: "#fff",
  },
  notifButton: {
    marginTop: 10,
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  notifButtonText: {
    fontFamily: "Main-Bold",
    fontSize: rf(0.8),
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
