import React from "react";
import { View, ScrollView, Pressable, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { MotiView } from "moti";
import { useDispatch } from "react-redux";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { useDebugData, logLanDebug } from "@/service/observability/DebugService";
import { setSessionNetworkInfo, setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { encodeRoomCode } from "@/utils/roomCode";
import { GameSessionTransport } from "@/service/network/GameSessionTransport";
import { toast } from "@/components/feedback/toast";

export const LanDebugPanel: React.FC = () => {
  const debug = useDebugData();
  const dispatch = useDispatch();

  const handleForceHotspotIp = () => {
    const forcedIp = "192.168.43.1";
    const port = GameSessionTransport.getListeningPort() || 8081;
    const code = encodeRoomCode(forcedIp, port);
    
    logLanDebug(`DEBUG: Forcing hotspot IP to ${forcedIp}`);
    
    dispatch(setSessionNetworkInfo({ 
      hostIp: forcedIp, 
      roomCode: code 
    }));
    dispatch(setLocalSessionIdentity({ localIp: forcedIp }));
    toast.success("Forced IP", forcedIp);
  };

  const handleCopyDebug = async () => {
    const report = JSON.stringify(debug, null, 2);
    await Clipboard.setStringAsync(report);
    toast.success("Debug Copied", "Logs saved to clipboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listening": return "#22c55e";
      case "failed": return "#ef4444";
      case "starting": return "#eab308";
      default: return "#94a3b8";
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 w-full rounded-3xl border border-white/10 bg-black/40 p-5"
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-main-bold text-xs uppercase tracking-[2px] text-blue-400">
          LAN Debug Panel
        </Text>
        <View 
          className="h-2 w-2 rounded-full" 
          style={{ backgroundColor: getStatusColor(debug.lanStatus) }} 
        />
      </View>

      <ScrollView className="max-h-[200px] mb-4">
        <DebugRow label="Status" value={debug.lanStatus} valueColor={getStatusColor(debug.lanStatus)} />
        <DebugRow label="Bind" value={debug.lanBindAddress} />
        <DebugRow label="Port" value={debug.lanPort.toString()} />
        <DebugRow label="Candidates" value={debug.lanCandidates.join(", ") || "none"} />
        <DebugRow label="Selected IP" value={debug.hostIp} />
        <DebugRow label="Type" value={debug.lanIsFallback ? "FALLBACK" : "REAL"} valueColor={debug.lanIsFallback ? "#eab308" : "#22c55e"} />
        <DebugRow label="Clients" value={debug.lanClientConnection} />
        <DebugRow label="Last Error" value={debug.lanLastError || "none"} valueColor="#ef4444" />
        
        <View className="mt-2 pt-2 border-t border-white/5">
          <Text className="text-[10px] uppercase text-white/30 mb-1">QR Payload</Text>
          <Text className="text-[10px] font-main-md text-white/60 leading-3">
            {debug.lanQrPayload || "waiting..."}
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row gap-3">
        <Pressable 
          onPress={handleForceHotspotIp}
          className="flex-1 rounded-xl bg-blue-500/10 border border-blue-500/20 py-3 items-center"
        >
          <Text className="text-[10px] font-main-bold uppercase tracking-wider text-blue-400">
            Force Hotspot IP
          </Text>
        </Pressable>
        
        <Pressable 
          onPress={handleCopyDebug}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 items-center"
        >
          <Text className="text-[10px] font-main-bold uppercase tracking-wider text-white/60">
            Copy Debug
          </Text>
        </Pressable>
      </View>
    </MotiView>
  );
};

const DebugRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <View className="flex-row justify-between py-1 border-b border-white/5">
    <Text className="text-[10px] text-white/40 uppercase">{label}</Text>
    <Text style={{ color: valueColor || "#cbd5e1" }} className="text-[10px] font-main-md">{value}</Text>
  </View>
);
