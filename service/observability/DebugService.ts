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
  lanBindAddress: string;
  lanPort: number;
  lanCandidates: string[];
  lanIsFallback: boolean;
  lanQrPayload: string;
  lanLastError: string;
  lanClientConnection: string;
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
  lanBindAddress: "0.0.0.0",
  lanPort: 0,
  lanCandidates: [],
  lanIsFallback: false,
  lanQrPayload: "",
  lanLastError: "",
  lanClientConnection: "none",
};

/**
 * Logcat utility with the required tag
 */
export const logLanDebug = (message: string, data?: any) => {
  const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : "";
  console.log(`[LAN_DEBUG] ${message}${dataStr}`);
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
