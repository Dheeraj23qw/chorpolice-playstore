import { useEffect, useState } from "react";

interface DebugState {
  lastPacketType: string;
  latency: number;
  connectionCount: number;
  isHeartbeatActive: boolean;
  quizRound: number;
  quizDifficulty: string;
  lastQuestionSync: string;
  localIp: string;
  hostIp: string;
  discoveredHostCount: number;
  // LAN DEBUG FIELDS
  lanStatus: "idle" | "starting" | "listening" | "failed";
  lanUdpBroadcaster: "idle" | "starting" | "running" | "failed" | "error";
  lanUdpListener: "idle" | "listening" | "failed" | "error";
  lanLastUdpPacket: string;
  lanBindAddress: string;
  lanPort: number;
  lanCandidates: string[];
  lanIsFallback: boolean;
  lanQrPayload: string;
  lanLastError: string;
  lanClientConnection: string;
  lanLogs: string[];
}

const debugState: DebugState = {
  lastPacketType: "NONE",
  latency: 0,
  connectionCount: 0,
  isHeartbeatActive: false,
  quizRound: 0,
  quizDifficulty: "N/A",
  lastQuestionSync: "None",
  localIp: "unknown",
  hostIp: "N/A",
  discoveredHostCount: 0,
  lanStatus: "idle",
  lanUdpBroadcaster: "idle",
  lanUdpListener: "idle",
  lanLastUdpPacket: "none",
  lanBindAddress: "0.0.0.0",
  lanPort: 0,
  lanCandidates: [],
  lanIsFallback: false,
  lanQrPayload: "",
  lanLastError: "",
  lanClientConnection: "none",
  lanLogs: [],
};

/**
 * Logcat utility with the required tag + in-app history
 */
export const logLanDebug = (message: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : "";
  const logLine = `[${timestamp}] ${message}${dataStr}`;
  
  console.log(`[LAN_DEBUG] ${logLine}`);
  
  debugState.lanLogs = [logLine, ...debugState.lanLogs].slice(0, 50);
};

export const useDebugData = () => {
  const [data, setData] = useState<DebugState>(debugState);

  useEffect(() => {
    const interval = setInterval(() => {
      setData({ ...debugState });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return data;
};

export const updateDebugMetric = <K extends keyof DebugState>(
  key: K,
  value: DebugState[K],
) => {
  debugState[key] = value;
};
