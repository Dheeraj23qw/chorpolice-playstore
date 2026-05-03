import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { useDispatch } from "react-redux";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { logLanDebug } from "@/service/observability/DebugService";
import { setSessionNetworkInfo, setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { encodeRoomCode } from "@/utils/roomCode";
import { GameSessionTransport } from "@/service/network/GameSessionTransport";
import { toast } from "@/components/feedback/toast";

export const HotspotTroubleshootingCard: React.FC = () => {
  const dispatch = useDispatch();
  const [isFixed, setIsFixed] = useState(false);

  const handleFix = () => {
    const forcedIp = "192.168.43.1";
    const port = GameSessionTransport.getListeningPort() || 8081;
    const code = encodeRoomCode(forcedIp, port);
    
    logLanDebug(`USER: Applied Hotspot Fix (IP -> ${forcedIp})`);
    
    dispatch(setSessionNetworkInfo({ 
      hostIp: forcedIp, 
      roomCode: code,
      isFallback: true
    }));
    dispatch(setLocalSessionIdentity({ localIp: forcedIp }));
    
    setIsFixed(true);
    toast.success("Hotspot Mode Enabled", "Ask friends to connect to your hotspot.");
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mt-4 w-full rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4"
    >
      <AnimatePresence mode="wait">
        {!isFixed ? (
          <MotiView 
            key="trouble"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="items-center"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="help-circle-outline" size={rf(1.8)} color="#93c5fd" />
              <Text style={{ fontSize: rf(1.4) }} className="font-main-bold text-blue-300">
                Having trouble finding hotspot?
              </Text>
            </View>
            <Text style={{ fontSize: rf(1.25) }} className="text-center text-white/50 mb-4 px-2">
              If you are using your phone hotspot, tap below to continue.
            </Text>
            
            <Pressable 
              onPress={handleFix}
              className="w-full rounded-xl bg-blue-500/20 border border-blue-500/30 py-3 items-center"
            >
              <Text style={{ fontSize: rf(1.3) }} className="font-main-bold uppercase tracking-wider text-blue-200">
                Try Hotspot Fix
              </Text>
            </Pressable>
          </MotiView>
        ) : (
          <MotiView 
            key="fixed"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="items-center"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="checkmark-circle-outline" size={rf(1.8)} color="#4ade80" />
              <Text style={{ fontSize: rf(1.4) }} className="font-main-bold text-green-400">
                Hotspot mode enabled.
              </Text>
            </View>
            <Text style={{ fontSize: rf(1.25) }} className="text-center text-white/60 px-2">
              Ask friends to connect to your hotspot and scan the QR code.
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </MotiView>
  );
};
