import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Text } from "@/components/Text";
import { LinearGradient } from "expo-linear-gradient";
import { rf } from "@/utils/responsive";
import { NETWORK } from "@/constants/Networking";
import { reconnectToHost } from "@/service/lanGameService";

/**
 * @component ReconnectOverlay
 * @description A glassy, premium overlay shown when connection is lost mid-game.
 * Adheres to the game's neon + glassmorphism aesthetic.
 */
export const ReconnectOverlay = () => {
  const { isReconnecting, reconnectTimeoutRemaining, hostIp, localPlayerId, isHost } = useSelector(
    (state: RootState) => state.session
  );

  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (isReconnecting && !isHost && hostIp && localPlayerId) {
      // Periodic reconnection attempts
      const interval = setInterval(() => {
        setAttemptCount(prev => prev + 1);
        reconnectToHost(hostIp, localPlayerId);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isReconnecting, isHost, hostIp, localPlayerId]);

  if (!isReconnecting) return null;

  return (
    <Modal transparent visible animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View className="flex-1 items-center justify-center p-6">
          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400 }}
            className="w-full max-w-sm overflow-hidden rounded-[32px] border border-white/10"
          >
            <LinearGradient
              colors={["rgba(30, 30, 50, 0.8)", "rgba(10, 10, 20, 0.95)"]}
              className="p-8 items-center"
            >
              {/* NEON GLOW EFFECT */}
              <View 
                className="absolute inset-0 rounded-[32px]" 
                style={{ 
                  borderWidth: 1, 
                  borderColor: "rgba(99, 102, 241, 0.3)",
                  shadowColor: "#6366F1",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                }} 
              />

              <MotiView
                animate={{ rotate: "360deg" }}
                transition={{ loop: true, repeatReverse: false, duration: 2000, type: "timing" }}
                className="mb-6 h-16 w-16 items-center justify-center rounded-full border-2 border-indigo-500/30"
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  className="h-12 w-12 items-center justify-center rounded-full shadow-lg shadow-indigo-500"
                >
                  <ActivityIndicator color="white" size="small" />
                </LinearGradient>
              </MotiView>

              <Text className="font-main-bold text-center text-2xl text-white">
                Connection Lost
              </Text>
              
              <Text className="mt-2 text-center text-indigo-300/80">
                {isHost 
                  ? "Waiting for players to return..." 
                  : "Trying to reconnect to host..."}
              </Text>

              <View className="mt-8 w-full">
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <MotiView
                    from={{ width: "100%" }}
                    animate={{ 
                      width: `${(reconnectTimeoutRemaining / (NETWORK.RECONNECT_TIMEOUT_MS / 1000)) * 100}%` 
                    }}
                    transition={{ type: "timing", duration: 1000 }}
                    className="h-full bg-indigo-500 shadow-sm shadow-indigo-400"
                  />
                </View>
                
                <View className="mt-3 flex-row justify-between px-1">
                  <Text className="text-[10px] uppercase tracking-widest text-white/30">
                    Auto-Recovery
                  </Text>
                  <Text className="font-main-bold text-xs text-indigo-400">
                    {reconnectTimeoutRemaining}s remaining
                  </Text>
                </View>
              </View>

              {attemptCount > 0 && !isHost && (
                <Text className="mt-4 text-[10px] text-white/20 italic">
                  Attempt #{attemptCount}
                </Text>
              )}
            </LinearGradient>
          </MotiView>
        </View>
      </View>
    </Modal>
  );
};
