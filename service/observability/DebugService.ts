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
};

const useDebugData = () => {
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
