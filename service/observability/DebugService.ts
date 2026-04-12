import { useEffect, useState } from "react";

/**
 * --- DEBUG SERVICE ---
 * Adheres to Single Responsibility Principle (SRP).
 * Manages the observability state for the game networking.
 */

export interface DebugState {
  lastPacketType: string;
  latency: number;
  connectionCount: number;
  isHeartbeatActive: boolean;
  quizRound: number;
  quizDifficulty: string;
  lastQuestionSync: string;
}

export const debugState: DebugState = {
  lastPacketType: "NONE",
  latency: 0,
  connectionCount: 0,
  isHeartbeatActive: false,
  quizRound: 0,
  quizDifficulty: "N/A",
  lastQuestionSync: "None"
};

/**
 * Hook for UI components to consume network debug data.
 */
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

/**
 * Updates the debug state with fresh metrics.
 */
export const updateDebugMetric = (key: keyof DebugState, value: any) => {
  (debugState as any)[key] = value;
};
