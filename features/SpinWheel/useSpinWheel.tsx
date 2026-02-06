import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, Easing, Vibration, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";
import { creditCoins } from "../wallet/walletSlice";

export const useSpinWheel = () => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState<SpinStatus>("IDLE");
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  // Use a ref to track the cumulative rotation so the wheel doesn't "reset" visually
  const currentRotation = useRef(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // CLEANUP: Prevent memory leaks if the modal closes mid-animation
  useEffect(() => {
    return () => {
      spinAnim.stopAnimation();
      pulseLoopRef.current?.stop();
    };
  }, []);

  const reset = useCallback(() => {
    spinAnim.stopAnimation();
    pulseLoopRef.current?.stop();

    // Reset to 0 for a fresh start, or keep currentRotation.current
    // if you want it to stay where it landed.
    currentRotation.current = 0;
    spinAnim.setValue(0);
    scaleAnim.setValue(0);
    pulseAnim.setValue(1);

    setStatus("IDLE");
    setResult(null);
    setShowVictory(false);
  }, [spinAnim, scaleAnim, pulseAnim]);

  const animateModalIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 90,
    }).start();
  }, [scaleAnim]);

const handleSpin = useCallback(() => {
    if (status === "SPINNING") return;

    AudioEngine.play("spin");
    setStatus("SPINNING");

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    // --- INCREASED DURATION CONFIG ---
    const fullSpins = 25;      // Increased from 15 to 25 (More laps = more speed)
    const spinDuration = 8000; // Increased from 4.5s to 8s (Longer suspense)

    const centers = [315, 45, 225, 135];
    const targetCenter = centers[randomIndex];

    // Maintain cumulative rotation for reliability
    const extraRotation = (fullSpins * 360) + (360 - targetCenter);
    const finalValue = currentRotation.current + extraRotation;

    spinAnim.setValue(currentRotation.current); // Start from last position

    Animated.timing(spinAnim, {
      toValue: finalValue,
      duration: spinDuration,
      // Aggressive start, very slow creep at the end for maximum "Imperial" drama
      easing: Easing.bezier(0.12, 0.8, 0.1, 1), 
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      currentRotation.current = finalValue;
      setResult(selected);
      setStatus("DONE");

      if (selected.value > 0) {
        dispatch(
          creditCoins({
            amount: selected.value,
            reason: `Spin Reward - ${selected.label}`,
          }),
        );
        setShowVictory(true);
        Vibration.vibrate(Platform.OS === "ios" ? [0, 10] : 100);
      }

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
        ]),
      );
      pulseLoopRef.current.start();
    });
  }, [status, spinAnim, pulseAnim, dispatch]);

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
