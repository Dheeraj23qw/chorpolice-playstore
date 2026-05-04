import { useState, useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { OfflinePlayer } from "@/redux/reducers/offlineSessionSlice";

export type OfflineGamePhase = "idle" | "dealing" | "police_turn" | "result";

export interface RoundResult {
  winner: "police" | "thief";
  points: number[];
}

export interface OfflineGameContext {
  players: OfflinePlayer[];
  phase: OfflineGamePhase;
  roles: string[];
  clickedIndex: number | null;
  policeIndex: number | null;
  kingIndex: number | null;
  thiefIndex: number | null;
  advisorIndex: number | null;
  scores: number[];
  result: RoundResult | null;
  currentRound: number;
  totalRounds: number;
  handlePlay: () => void;
  handlePoliceGuess: (targetIndex: number) => void;
  resetGame: () => void;
  nextRound: () => void;
}

export const useOfflineChorPolice = (): OfflineGameContext => {
  const players = useSelector((state: RootState) => state.offlineSession.players);
  const totalRounds = useSelector((state: RootState) => state.offlineSession.totalRounds);
  
  const [phase, setPhase] = useState<OfflineGamePhase>("idle");
  const [currentRound, setCurrentRound] = useState(1);
  const [roles, setRoles] = useState<string[]>([]);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [policeIndex, setPoliceIndex] = useState<number | null>(null);
  const [kingIndex, setKingIndex] = useState<number | null>(null);
  const [thiefIndex, setThiefIndex] = useState<number | null>(null);
  const [advisorIndex, setAdvisorIndex] = useState<number | null>(null);
  const [result, setResult] = useState<RoundResult | null>(null);

  const initRoles = useCallback(() => {
    const baseRoles = ["King", "Advisor", "Thief", "Police"];
    const shuffled = [...baseRoles].sort(() => Math.random() - 0.5);
    
    setRoles(shuffled);
    setPoliceIndex(shuffled.indexOf("Police"));
    setKingIndex(shuffled.indexOf("King"));
    setThiefIndex(shuffled.indexOf("Thief"));
    setAdvisorIndex(shuffled.indexOf("Advisor"));
    
    setClickedIndex(null);
    setResult(null);
  }, []);

  useEffect(() => {
    initRoles();
  }, [initRoles]);

  const handlePlay = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("dealing");
    
    // Auto move from dealing to police_turn after animation duration
    const timer = setTimeout(() => {
      setPhase("police_turn");
    }, 4000); 

    return () => clearTimeout(timer);
  }, [phase]);

  const handlePoliceGuess = useCallback((targetIndex: number) => {
    if (phase !== "police_turn") return;
    const targetRole = roles[targetIndex];
    if (targetRole === "Police" || targetRole === "King") return;

    setClickedIndex(targetIndex);
    const isCorrect = targetRole === "Thief";
    const winner = isCorrect ? "police" : "thief";
    
    // Points logic
    const roundPoints = [0, 0, 0, 0];
    if (isCorrect) {
      if (kingIndex !== null) roundPoints[kingIndex] = 1000;
      if (advisorIndex !== null) roundPoints[advisorIndex] = 800;
      if (policeIndex !== null) roundPoints[policeIndex] = 700;
      if (thiefIndex !== null) roundPoints[thiefIndex] = 0;
    } else {
      if (kingIndex !== null) roundPoints[kingIndex] = 1000;
      if (advisorIndex !== null) roundPoints[advisorIndex] = 800;
      if (policeIndex !== null) roundPoints[policeIndex] = 0;
      if (thiefIndex !== null) roundPoints[thiefIndex] = 500;
    }

    setResult({ winner, points: roundPoints });
    setScores(prev => prev.map((s, i) => s + roundPoints[i]));
    setPhase("result");
  }, [phase, roles, kingIndex, advisorIndex, policeIndex, thiefIndex]);

  const nextRound = useCallback(() => {
    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      initRoles();
      setPhase("idle");
    } else {
      // Game over logic could be added here
    }
  }, [currentRound, totalRounds, initRoles]);

  const resetGame = useCallback(() => {
    initRoles();
    setPhase("idle");
    setCurrentRound(1);
    setScores([0, 0, 0, 0]);
  }, [initRoles]);

  return useMemo(() => ({
    players,
    phase,
    roles,
    clickedIndex,
    policeIndex,
    kingIndex,
    thiefIndex,
    advisorIndex,
    scores,
    result,
    currentRound,
    totalRounds,
    handlePlay,
    handlePoliceGuess,
    resetGame,
    nextRound,
  }), [
    players, phase, roles, clickedIndex, policeIndex, kingIndex, 
    thiefIndex, advisorIndex, scores, result, currentRound, 
    totalRounds, handlePlay, handlePoliceGuess, resetGame, nextRound
  ]);
};
