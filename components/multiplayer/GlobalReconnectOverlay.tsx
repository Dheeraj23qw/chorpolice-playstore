import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, ActivityIndicator, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { 
  selectReconnectState, 
  tickReconnectWindow,
  clearReconnectState 
} from "@/redux/reducers/reconnectSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { reconnectToHost } from "@/service/lanGameService";

export const GlobalReconnectOverlay = () => {
  const dispatch = useDispatch<AppDispatch>();
  const playerImages = useSelector((state: RootState) => state.playerImages.images);
  const { 
    isActive, 
    disconnectedPlayerName, 
    disconnectedPlayerAvatar, 
    remainingSeconds, 
    reason 
  } = useSelector(selectReconnectState);

  // Tick the timer every second while active
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      dispatch(tickReconnectWindow());
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, dispatch]);

  const { isHost, hostIp, localPlayerId } = useSelector((state: RootState) => state.session);

  // Periodic reconnection attempts for clients
  useEffect(() => {
    if (isActive && !isHost && hostIp && localPlayerId) {
      const interval = setInterval(() => {
        reconnectToHost(hostIp, localPlayerId);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isActive, isHost, hostIp, localPlayerId]);

  if (!isActive) return null;

  const isHostLost = reason === "host_lost";

  return (
    <Modal
      transparent
      visible={isActive}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          style={styles.cardWrapper}
        >
          <LinearGradient
            colors={["rgba(30, 30, 45, 0.95)", "rgba(15, 15, 25, 0.98)"]}
            style={styles.card}
          >
            {/* Glow effect */}
            <View style={styles.glow} />

            <View style={styles.header}>
              <View style={styles.warningIconWrapper}>
                <Ionicons name="alert-circle" size={rf(4)} color="#FACC15" />
              </View>
              <Text style={styles.title} className="font-main-bold">
                Connection unstable
              </Text>
            </View>

            <View style={styles.content}>
              <View className="relative">
                <View className="h-24 w-24 overflow-hidden rounded-3xl border-2 border-white/20 bg-white/5">
                  <Image 
                    source={playerImages[disconnectedPlayerAvatar || 1]?.src}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="absolute -right-2 -top-2 rounded-full border-2 border-slate-900 bg-red-500 p-1.5 shadow-lg">
                  <Ionicons name="flash-off" size={14} color="white" />
                </View>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName} className="font-main-bold">
                  {disconnectedPlayerName || (isHostLost ? "Host" : "Player")}
                </Text>
                <Text style={styles.playerStatus}>
                  {isHostLost ? "Connection with host unstable" : "Connection unstable"}
                </Text>
              </View>

              <View style={styles.timerSection}>
                <View style={styles.timerCircle}>
                   <Text style={styles.timerText} className="font-main-bold">
                     {remainingSeconds}
                   </Text>
                   <Text style={styles.timerLabel}>SEC</Text>
                </View>
                <Text style={styles.instruction}>
                  Trying to reconnect...
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <ActivityIndicator color="#6366F1" size="small" style={{ marginRight: 10 }} />
              <Text style={styles.statusText}>
                Trying to resume match...
              </Text>
            </View>
          </LinearGradient>
        </MotiView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cardWrapper: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  glow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    filter: "blur(40px)",
  } as any,
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  warningIconWrapper: {
    marginBottom: 10,
    shadowColor: "#FACC15",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  title: {
    fontSize: rf(2.4),
    color: "#fff",
    textAlign: "center",
  },
  content: {
    alignItems: "center",
  },
  playerInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: rf(4),
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 10,
  },
  playerName: {
    fontSize: rf(2),
    color: "#fff",
  },
  playerStatus: {
    fontSize: rf(1.6),
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  timerSection: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 20,
    borderRadius: 20,
    width: "100%",
  },
  timerCircle: {
    width: rf(8),
    height: rf(8),
    borderRadius: rf(4),
    borderWidth: 3,
    borderColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  timerText: {
    fontSize: rf(2.8),
    color: "#fff",
    lineHeight: rf(3),
  },
  timerLabel: {
    fontSize: rf(1),
    color: "rgba(255,255,255,0.4)",
    marginTop: -2,
  },
  instruction: {
    fontSize: rf(1.5),
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  statusText: {
    fontSize: rf(1.4),
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
  },
});
