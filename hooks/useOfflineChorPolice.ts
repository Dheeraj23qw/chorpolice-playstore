import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { OfflinePlayer } from "@/redux/reducers/offlineSessionSlice";
import { AudioEngine } from "@/audio/audioEngine";
import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";

export type OfflineGamePhase = "idle" | "dealing" | "public_reveal" | "investigation_shuffle" | "police_turn" | "result";

export interface InvestigationTarget {
  id: string;
  role: string;
  playerIndex: number | null; // null for fake Joker
}

export interface RoundResult {
  winner: "police" | "thief";
  points: number[];
}

export interface OfflineGameContext {
  players: OfflinePlayer[];
  phase: OfflineGamePhase;
  roles: string[];
  clickedIndex: number | null;
  clickedTargetId: string | null;
  policeIndex: number | null;
  kingIndex: number | null;
  thiefIndex: number | null;
  advisorIndex: number | null;
  investigationTargets: InvestigationTarget[];
  mysteryRevealStep: number;
  scores: number[];
  result: RoundResult | null;
  currentRound: number;
  totalRounds: number;
  handlePlay: () => void;
  setPhase: (phase: OfflineGamePhase) => void;
  handlePoliceGuess: (targetId: string, playerIndex: number | null) => void;
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
  const [clickedTargetId, setClickedTargetId] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [policeIndex, setPoliceIndex] = useState<number | null>(null);
  const [kingIndex, setKingIndex] = useState<number | null>(null);
  const [thiefIndex, setThiefIndex] = useState<number | null>(null);
  const [advisorIndex, setAdvisorIndex] = useState<number | null>(null);
  const [investigationTargets, setInvestigationTargets] = useState<InvestigationTarget[]>([]);
  const [mysteryRevealStep, setMysteryRevealStep] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, []);

  const initRoles = useCallback(() => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    const baseRoles = ["King", "Advisor", "Thief", "Police"];
    const shuffled = [...baseRoles].sort(() => Math.random() - 0.5);
    
    const pIdx = shuffled.indexOf("Police");
    const kIdx = shuffled.indexOf("King");
    const tIdx = shuffled.indexOf("Thief");
    const aIdx = shuffled.indexOf("Advisor");

    setRoles(shuffled);
    setPoliceIndex(pIdx);
    setKingIndex(kIdx);
    setThiefIndex(tIdx);
    setAdvisorIndex(aIdx);
    
    // Setup investigation targets: Thief, Advisor, and a fake Joker
    const targets: InvestigationTarget[] = [
      { id: "target_thief", role: "Thief", playerIndex: tIdx },
      { id: "target_advisor", role: "Advisor", playerIndex: aIdx },
      { id: "target_joker", role: "Joker", playerIndex: null }, // Joker has no player
    ];
    // Shuffle the targets so they are in random positions
    setInvestigationTargets([...targets].sort(() => Math.random() - 0.5));

    setClickedIndex(null);
    setClickedTargetId(null);
    setResult(null);
    setMysteryRevealStep(0);
  }, []);

  useEffect(() => {
    initRoles();
  }, [initRoles]);

  const handlePlay = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("dealing");
  }, [phase]);

  const handlePoliceGuess = useCallback((targetId: string, playerIndex: number | null) => {
    if (phase !== "police_turn") return;
    
    const target = investigationTargets.find(t => t.id === targetId);
    if (!target) return;

    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    setClickedTargetId(targetId);
    setClickedIndex(playerIndex);
    
    const isCorrect = target.role === "Thief";
    const winner = isCorrect ? "police" : "thief";
    
    // Points logic
    const roundPoints = [0, 0, 0, 0];
    if (isCorrect) {
      if (kingIndex !== null) roundPoints[kingIndex] = 1000;
      if (advisorIndex !== null) roundPoints[advisorIndex] = 800;
      if (policeIndex !== null) roundPoints[policeIndex] = 500;
      if (thiefIndex !== null) roundPoints[thiefIndex] = 0;
    } else {
      if (kingIndex !== null) roundPoints[kingIndex] = 1000;
      if (advisorIndex !== null) roundPoints[advisorIndex] = 800;
      if (policeIndex !== null) roundPoints[policeIndex] = 0;
      if (thiefIndex !== null) roundPoints[thiefIndex] = 500;
    }

    // Smash-out reveal sequence — identical to multiplayer:
    //   step 1 — board freezes; the 2 unselected cards smash off the phone.
    //   step 2 — the selected card travels to the center.
    //   step 3 — the selected card flips.
    //   then the result cinematic starts.
    setMysteryRevealStep(1);

    const T_RISE = CP_FLOW_TIMINGS.MYSTERY_FREEZE_MS;
    revealTimeoutRef.current = setTimeout(() => {
      setMysteryRevealStep(2);
      revealTimeoutRef.current = setTimeout(() => {
        setMysteryRevealStep(3);
        AudioEngine.play("select", "ui");
        revealTimeoutRef.current = setTimeout(() => {
          setResult({ winner, points: roundPoints });
          setScores(prev => prev.map((s, i) => s + roundPoints[i]));
          setMysteryRevealStep(0);
          setPhase("result");
          revealTimeoutRef.current = null;
        }, CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS);
      }, CP_FLOW_TIMINGS.MYSTERY_RISE_MS + CP_FLOW_TIMINGS.MYSTERY_CENTER_HOLD_MS);
    }, T_RISE);
  }, [phase, investigationTargets, kingIndex, advisorIndex, policeIndex, thiefIndex]);

  const nextRound = useCallback(() => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      initRoles();
      setPhase("idle");
    }
  }, [currentRound, totalRounds, initRoles]);

  const resetGame = useCallback(() => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

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
    clickedTargetId,
    policeIndex,
    kingIndex,
    thiefIndex,
    advisorIndex,
    investigationTargets,
    mysteryRevealStep,
    scores,
    result,
    currentRound,
    totalRounds,
    handlePlay,
    setPhase,
    handlePoliceGuess,
    resetGame,
    nextRound,
  }), [
    players, phase, roles, clickedIndex, clickedTargetId, policeIndex, kingIndex, 
    thiefIndex, advisorIndex, investigationTargets, mysteryRevealStep, scores, 
    result, currentRound, totalRounds, handlePlay, handlePoliceGuess, resetGame, 
    nextRound
  ]);
};
