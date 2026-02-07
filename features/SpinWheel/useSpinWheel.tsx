import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, Easing, Vibration, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";
import { creditCoins } from "../wallet/walletSlice";
import { useTimeoutManager } from "@/hooks/useTimeOutManager";

export const useSpinWheel = () => {
  const dispatch = useDispatch();

  // --- UI STATES ---
  const [status, setStatus] = useState<SpinStatus>("IDLE");
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  // --- TIMEOUT MANAGER ---
  // We lock timeouts if status is IDLE to ensure a clean slate
  const { safeSetTimeout, clearAllTimeouts } = useTimeoutManager(status === "IDLE");

  // --- ANIMATION VALUES ---
  const currentRotation = useRef(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // --- REFS FOR CLEANUP ---
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Robust cleanup on unmount
  useEffect(() => {
    return () => {
      spinAnim.stopAnimation();
      pulseLoopRef.current?.stop();
      clearAllTimeouts();
    };
  }, []);

  /**
   * RESET: Cleans up all animations and timers
   * Used when modal closes or before a fresh start
   */
  const reset = useCallback(() => {
    spinAnim.stopAnimation();
    pulseLoopRef.current?.stop();
    clearAllTimeouts();

    currentRotation.current = 0;
    spinAnim.setValue(0);
    scaleAnim.setValue(0);
    pulseAnim.setValue(1);

    setStatus("IDLE");
    setResult(null);
    setShowVictory(false);
  }, [spinAnim, scaleAnim, pulseAnim, clearAllTimeouts]);

  /**
   * MODAL ENTRY: Springs the UI into view
   */
  const animateModalIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 90,
    }).start();
  }, [scaleAnim]);

  /**
   * HANDLE SPIN: The core logic
   */
  const handleSpin = useCallback(() => {
    if (status === "SPINNING") return;

    AudioEngine.play("spin");
    setStatus("SPINNING");

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    // --- CRAZY IMPERIAL CONFIG ---
    const fullSpins = 25;      // High velocity
    const spinDuration = 8000; // 8 seconds of suspense
    const centers = [315, 45, 225, 135];
    const targetCenter = centers[randomIndex];

    // Calculate rotation to land exactly in the center of the quadrant
    const extraRotation = (fullSpins * 360) + (360 - targetCenter);
    const finalValue = currentRotation.current + extraRotation;

    spinAnim.setValue(currentRotation.current);

    Animated.timing(spinAnim, {
      toValue: finalValue,
      duration: spinDuration,
      // Aggressive start, very slow creep at the end
      easing: Easing.bezier(0.12, 0.8, 0.1, 1), 
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      currentRotation.current = finalValue;
      setResult(selected);
      setStatus("DONE");

      // 1. Reward Logic
      if (selected.value > 0) {
        dispatch(
          creditCoins({
            amount: selected.value,
            reason: `Spin Reward - ${selected.label}`,
          })
        );
        setShowVictory(true);
        Vibration.vibrate(Platform.OS === "ios" ? [0, 10] : 100);
      }


      // 3. Victory Pulse Animation
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoopRef.current.start();
    });
  }, [status, spinAnim, pulseAnim, dispatch, safeSetTimeout]);

  return {
    status,
    result,
    showVictory,
    spinAnim,
    scaleAnim,
    pulseAnim,
    segments,
    setShowVictory,
    handleSpin,
    reset,
    animateModalIn,
  };
};